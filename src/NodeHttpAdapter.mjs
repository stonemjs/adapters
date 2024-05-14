import mime from 'mime'
import http from 'node:http'
import accepts from 'accepts'
import https from 'node:https'
import statuses from 'statuses'
import onFinished from 'on-finished'
import { Adapter } from './Adapter.mjs'
import { isBrowser, RuntimeError, NODE_HTTP_PLATFORM } from '@stone-js/common'

/**
 * Class representing a NodeHTTPAdapter.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @extends Adapter
 */
export class NodeHTTPAdapter extends Adapter {
  #url
  #server

  /**
   * Create an Apapter.
   *
   * @param {Function} handlerFactory - Factory to create a new instance of handler.
   * @param {Object} [options={}] - Adpater configuration options.
   */
  constructor (handlerFactory, options = {}) {
    super(handlerFactory, options)

    this.#url = new URL('', options.url ?? 'http://localhost:8080')
    this.#server = (this.#isSecure ? https : http).createServer(options.server ?? {}, (message, response) => this.#eventListener(message, response))
  }

  /** @returns {boolean} */
  get #isSecure () {
    return this.#url.protocol.replace(':', '') === 'https'
  }

  /**
   * Run handler.
   *
   * @returns {void}
   */
  async run () {
    await this._onInit()

    return new Promise((resolve, reject) => {
      this
        .#server
        .listen(this.#url.port, this.#url.hostname, () => {
          console.info(`Server started at: ${this.#url.href}`)
          resolve(this.#server)
        })
        .once('error', (error) => {
          console.error(error, 'An unexpected error has occurred.')
          reject(error)
        })
    })
  }

  /**
   * Hook that runs at each events and just before running the action handler.
   *
   * @throws {RuntimeError}
   */
  async _onInit () {
    if (isBrowser()) {
      throw new RuntimeError('This `NodeHTTPAdapter` must be used only in node.js context.')
    }

    this.#catchUncaughtExceptionListener()

    await super._onInit()
  }

  /**
   * Hook that runs after running the action handler.
   *
   * @param {(Function|Object)} handler - Action handler to be ran.
   * @param {Object} input - Platform-specific input.
   */
  _onTerminate (handler, input) {
    onFinished(input.response, async () => await super._onTerminate(handler, input))
  }

  /**
   * Handle error.
   *
   * @param   {Container} container - Service container.
   * @param   {Error} error
   * @param   {Object} message - Incomming Platform-specific message.
   * @returns {Object} - Platform-specific output.
   */
  _handleError (container, error, { message, response }) {
    const errorHandler = this._getErrorHandler(container)
    const contentType = mime.getType(accepts(message).type(['json', 'html']) ?? 'txt')

    errorHandler.report(error)

    response.statusCode = error.statusCode ?? 500
    response.statusMessage = error.statusMessage ?? statuses.message[response.statusCode]

    response.setHeader('content-type', contentType)
    error.headers?.forEach((value, key) => response.setHeader(key, value))
    response.end(JSON.stringify(errorHandler.render(error)))
  }

  async #eventListener (message, response) {
    const handler = this._handlerFactory()
    const container = handler.container

    try {
      this._setPlatform(container, NODE_HTTP_PLATFORM)

      container?.instance('nodeServer', this.#server)

      await this._beforeHandle(handler)
      await this._onMessageReceived(handler, { message, response })
    } catch (error) {
      this._handleError(container, error, { message, response })
    }
  }

  #catchUncaughtExceptionListener () {
    process
      .on('uncaughtException', (error) => {
        this._getLogger().fatal
          ? this._getLogger().fatal(error, 'Uncaught exception detected.')
          : this._getLogger().error(error, 'Uncaught exception detected.')

        this.#server.close(() => process.exit(1))

        setTimeout(() => process.abort(), 1000).unref()

        throw error
      })
      .on('unhandledRejection', (reason, promise) => {
        this._getLogger().error(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
        throw reason
      })
  }
}

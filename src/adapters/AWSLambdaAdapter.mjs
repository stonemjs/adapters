import mime from 'mime'
import accepts from 'accepts'
import statuses from 'statuses'
import { Adapter } from './Adapter.mjs'
import { AWS_LAMBDA_PLATFORM } from '../constants.mjs'
import { isBrowser, RuntimeError } from '@stone-js/common'

/**
 * Class representing a AWSLambdaAdapter.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @extends Adapter
 */
export class AWSLambdaAdapter extends Adapter {
  /**
   * Run handler.
   *
   * @returns {Function}
   * @throws  {RuntimeError}
   */
  async run () {
    await this._onInit()

    return async (message, context) => {
      const handler = this._handlerFactory()
      const container = handler.container

      try {
        this._setPlatform(container, AWS_LAMBDA_PLATFORM)

        container?.instance('awsContext', context)

        await this._beforeHandle(handler)

        return await this._onMessageReceived(handler, { message, context })
      } catch (error) {
        return this._handleError(container, error, { message })
      }
    }
  }

  /**
   * Hook that runs at each events and just before running the action handler.
   *
   * @throws {RuntimeError}
   */
  async _onInit () {
    if (isBrowser()) {
      throw new RuntimeError('This `AWSLambdaAdapter` must be used only in AWS node.js container context.')
    }

    await super._onInit()
  }

  /**
   * Handle error.
   *
   * @param   {Container} container - Service container.
   * @param   {Error} error
   * @param   {Object} message - Incomming Platform-specific message.
   * @returns {Object} - Platform-specific output.
   */
  _handleError (container, error, { message }) {
    const response = {}
    const errorHandler = this._getErrorHandler(container)

    errorHandler.report(error)

    if (message.headers) {
      response.headers = { 'content-type': mime.getType(accepts(message).type(['json', 'html']) ?? 'txt') }
    }

    response.statusCode = error.statusCode ?? 500
    response.body = JSON.stringify(errorHandler.render(error))
    response.statusMessage = error.statusMessage ?? statuses.message[response.statusCode]

    error.headers?.forEach((value, key) => { response.headers[key] = value })

    return response
  }
}

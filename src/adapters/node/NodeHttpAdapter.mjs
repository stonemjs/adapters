import http from 'node:http'
import https from 'node:https'
import onFinished from 'on-finished'
import { Adapter } from '../Adapter.mjs'
import { Request } from '@stone-js/http'
import { NodeHTTPMapper } from '../../mappers/node/NodeHTTPMapper.mjs'

export class NodeHttpAdapter extends Adapter {
  #mapper
  #options

  constructor (app, configurations = {}) {
    super(app, configurations)

    this.#options = this.#getOptions()
    this.#mapper = new NodeHTTPMapper(this.getContext().container)
  }

  async run () {
    return new Promise((resolve, reject) => {
      this
        .#options
        .server
        .createServer(this.#options.serverOptions, this.#requestListener)
        .listen(this.#options.port, this.#options.hostname, () => {
          this.#options.isDebug && console.info('Server started at:', this.#options.host)
          resolve()
        })
        .once('error', error => {
          this.#options.isDebug && console.error('An error occured', error)
          reject(error)
        })
    })
  }

  async #requestListener (req, res) {
    const context = this.getContext()
    const request = await this.#createRequest(context, req)
    const response = await context.run()

    res = await this.#mapper.response({ context, req, res, request, response })

    res.send()

    onFinished(res, async () => await context.stop())
  }

  async #createRequest (context, req) {
    const request = await this.#mapper.request(req)
    context.registerInstance(Request, request, ['request'])
    context.registerInstance('originalRequest', request.clone())

    Request.macro('getNodeRequest', () => req)

    return request
  }

  #getOptions () {
    return {
      isDebug: this.config.get('app.debug', false),
      port: this.config.get('http.server.port', 8080),
      get server () { return this.isSecure ? https : http },
      get host () { return `${this.hostname}:${this.port}` },
      hostname: this.config.get('http.server.hostname', 'localhost'),
      isSecure: this.config.get('http.server.protocol', 'http') === 'https',
      serverOptions: {
        key: this.config.get('http.server.key', undefined),
        cert: this.config.get('http.server.cert', undefined),
        requestTimeout: this.config.get('http.server.requestTimeout', 300000)
      }
    }
  }
}

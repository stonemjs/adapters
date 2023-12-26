import mime from 'mime'
import http from 'node:http'
import accepts from 'accepts'
import https from 'node:https'
import statuses from 'statuses'
import onFinished from 'on-finished'
import { Adapter } from '../Adapter.mjs'
import { NodeHTTPMapper } from '../../mappers/node/NodeHTTPMapper.mjs'

export class NodeHttpAdapter extends Adapter {
  #mapper
  #options

  constructor (app, configurations = {}) {
    super(app, configurations)

    this.#options = this.#getOptions()
    this.#mapper  = new NodeHTTPMapper(this.context.container)
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
    try {
      const request = await this.#mapper.request({ event: req })
      
      this.registerRequest(request)
  
      const response = await this.context.run()
      const nodeRes  = await this.#mapper.response({ event: req, res, request, response })
  
      await nodeRes.send()
    
    } catch (error) {
      console.error(error)
      
      const contentType = mime.getType(accepts(req).type(['json', 'html']) ?? 'txt')
      
      res.statusCode = 500
      res.statusMessage = statuses.message[500]
      res.setHeader('Content-Type', contentType)
      res.end()
    }

    onFinished(res, async () => await this.context.stop())
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

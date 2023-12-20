import { isFromTrustedProxy } from '../../../utils.mjs'

export class CommonPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (request, event, ctx, next) {
    request.headers = event.headers
    request.protocol = this.#getProtocol()
    request.method = this.#getMethod(event)
    request.queryString = event.queryStringParameters

    return next(request, event, ctx)
  }

  #getMethod (event) {
    return event.httpMethod
      ?? event.requestContext?.httpMethod
      ?? event.requestContext?.http?.method
      ?? 'GET'
  }

  #getProtocol (event) {
    const proto = event.socket.encrypted ? 'https' : 'http'
    if (!isFromTrustedProxy(event.socket.remoteAddress)) return proto
    return (event.headers['X-Forwarded-Proto'] || proto).split(',').shift().trim()
  }

  #createRequest (event, context, options) {
    const url = new URL(`${event.rawPath}?=${event.rawQueryString}`, `http://${options.host}`)
    const request = new Request(url, new Headers(event.headers), event.requestContext.http.method, event.body)
    request.lambda = { event, context }
    return request
  }
}

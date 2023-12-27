import { isFromTrustedProxy } from '../../../utils.mjs'

export class CommonPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    passable.request.headers = passable.event.headers
    passable.request.method = this.#getMethod(passable.event)
    passable.request.protocol = this.#getProtocol(passable.event)
    passable.request.queryString = passable.event.queryStringParameters
    passable.request.lambda = { event: passable.event, context: passable.ctx }

    return next(passable)
  }

  #getMethod (event) {
    return event.httpMethod ??
      event.requestContext?.httpMethod ??
      event.requestContext?.http?.method ??
      'GET'
  }

  #getProtocol (event) {
    const proto = event.socket.encrypted ? 'https' : 'http'
    const isTrusted = isFromTrustedProxy(this.#config.get('http'))
    if (!isTrusted(event.socket.remoteAddress)) return proto
    return (event.headers['X-Forwarded-Proto'] || proto).split(',').shift().trim()
  }
}

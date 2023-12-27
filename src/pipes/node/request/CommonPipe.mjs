import { isFromTrustedProxy } from '../../../utils.mjs'

export class CommonPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    passable.request.node = { req: passable.req }
    passable.request.method = passable.req.method
    passable.request.headers = passable.req.headers
    passable.request.protocol = this.#getProtocol(passable.req)

    return next(passable)
  }

  #getProtocol (req) {
    const proto = req.socket.encrypted ? 'https' : 'http'
    const isTrusted = isFromTrustedProxy(this.#config.get('http'))
    if (!isTrusted(req.socket.remoteAddress)) return proto
    return (req.headers['X-Forwarded-Proto'] || proto).split(',').shift().trim()
  }
}

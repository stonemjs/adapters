import { isFromTrustedProxy } from '../../../utils.mjs'

export class CommonPipe {
  async handler (passable, next) {
    passable.request.method = passable.req.method
    passable.request.headers = passable.req.headers
    passable.request.protocol = this.#getProtocol(passable.req)

    return next(passable)
  }

  #getProtocol (req) {
    const proto = req.socket.encrypted ? 'https' : 'http'
    if (!isFromTrustedProxy(req.socket.remoteAddress)) return proto
    return (req.headers['X-Forwarded-Proto'] || proto).split(',').shift().trim()
  }
}

import { isFromTrustedProxy } from '../../../utils.mjs'

export class CommonPipe {
  async handler (request, req, next) {
    request.method   = request.method
    request.headers  = request.headers
    request.protocol = this.#getProtocol()
    
    return next(request, req)
  }

  #getProtocol (req) {
    const proto = req.socket.encrypted ? 'https' : 'http'
    if (!isFromTrustedProxy(req.socket.remoteAddress)) return proto
    return (req.headers['X-Forwarded-Proto'] || proto).split(',').shift().trim()
  }
}
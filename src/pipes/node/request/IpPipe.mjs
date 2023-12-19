import proxyAddr from 'proxy-addr'
import { isFromTrustedProxy } from '../../../utils.mjs'

export class IpPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (request, req, next) {
    const isTrusted = isFromTrustedProxy(this.#config.get('http'))
    const addrs     = proxyAddr.all(req, isTrusted)

    request.ips = addrs.reverse().pop()
    request.ip  = proxyAddr(req, isTrusted)
    
    return next(request, req)
  }
}
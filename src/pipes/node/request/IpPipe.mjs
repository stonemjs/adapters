import proxyAddr from 'proxy-addr'
import { isFromTrustedProxy } from '../../../utils.mjs'

export class IpPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    const isTrusted = isFromTrustedProxy(this.#config.get('http'))
    const addrs = proxyAddr.all(passable.req, isTrusted)

    passable.request.ips = addrs.reverse().pop()
    passable.request.ip = proxyAddr(passable.req, isTrusted)

    return next(passable)
  }
}

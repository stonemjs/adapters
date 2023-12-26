import proxyAddr from 'proxy-addr'
import { isFromTrustedProxy } from '../../../utils.mjs'

export class IpPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    const data = {
      headers: {
        'x-forwarded-for': passable.event.headers['x-forwarded-for'] ?? passable.event.headers['X-Forwarded-For']
      },
      connection: {
        remoteAddress: passable.event.requestContext?.identity?.sourceIp ?? passable.event.requestContext?.http?.sourceIp ?? ''
      }
    }

    const isTrusted = isFromTrustedProxy(this.#config.get('http'))
    const addrs = proxyAddr.all(data, isTrusted)

    passable.request.ips = addrs.reverse().pop()
    passable.request.ip = proxyAddr(data, isTrusted)

    return next(passable)
  }
}

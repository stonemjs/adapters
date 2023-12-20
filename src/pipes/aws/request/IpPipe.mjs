import proxyAddr from 'proxy-addr'
import { isFromTrustedProxy } from '../../../utils.mjs'

export class IpPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (request, event, ctx, next) {
    const data = {
      headers: {
        'x-forwarded-for': event.headers['x-forwarded-for'] ?? event.headers['X-Forwarded-For']
      },
      connection: {
        remoteAddress: event.requestContext?.identity?.sourceIp ?? event.requestContext?.http?.sourceIp ?? ''
      }
    }
    
    const isTrusted = isFromTrustedProxy(this.#config.get('http'))
    const addrs = proxyAddr.all(data, isTrusted)

    request.ips = addrs.reverse().pop()
    request.ip = proxyAddr(data, isTrusted)

    return next(request, event, ctx)
  }
}

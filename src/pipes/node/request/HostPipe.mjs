import { URL } from 'node:url'
import proxyAddr from 'proxy-addr'
import { isFromTrustedProxy } from '../../../utils.mjs'
import { SuspiciousOperationException } from '@stone-js/http'

export class HostPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (request, req, next) {
    const url = new URL(req.url, `http://${this.#getHost(req)}`)

    request.url = url
    request.queryString = url.search
    
    return next(request, req)
  }

  #getHost (req) {
    let host = null
    const url = new URL(this.#config.get('url'))
    const allSubdomainRegex = new RegExp(`^(.+\.)?${url.hostname}$`)
i
    if (isFromTrustedProxy(req.socket.remoteAddress)) {
      host = (req.headers['X-Forwarded-Host'] || proto).split(',').shift().trim()
    } else if (req.headers.has('host')) {
      host = req.headers['host']
    } else {
      host = url.hostname
    }

    host = host.trim().replace(/:\d+$/, '').toLowerCase()

    // Validate host name as it comes from user
    if (host.replace(/(?:^\[)?[a-zA-Z0-9-:\]_]+\.?/, '').length) {
      throw new SuspiciousOperationException(`Invalid Host ${host}`)
    }

    if (this.#config.get('hosts.onlySubdomain')) {
      if (allSubdomainRegex.test(host)) {
        return host
      }

      throw new SuspiciousOperationException(`Untrusted Host ${host}`)
    }

    if (this.#config.get('hosts.trusted.length') || this.#config.get('hosts.trustedPattern.length')) {
      if (this.#config.get('hosts.trusted', '').includes(host)) {
        return host
      }

      if (this.#config.get('hosts.trustedPattern', []).reduce((prev, pattern) => pattern.test(host) || prev, false)) {
        return host
      }

      throw new SuspiciousOperationException(`Untrusted Host ${host}`)
    }

    return host
  }
}
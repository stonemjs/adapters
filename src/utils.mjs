import typeIs from 'type-is'
import { URL } from 'node:url'
import contentType from 'content-type'
import ipRangeCheck from 'ip-range-check'
import { SuspiciousOperationException } from '@stone-js/http'

export const isMultipart = (req) => {
  return typeIs(req, ['multipart']) === 'multipart'
}

export const getType = (req, config) => {
  try {
    return contentType.parse(req).type
  } catch (_) {
    return config.get('http.body.type', 'text/plain')
  }
}

export const getCharset = (req, config) => {
  try {
    return contentType.parse(req).parameters.charset
  } catch (_) {
    return config.get('http.body.defaultCharset', 'utf-8')
  }
}

export const isFromTrustedProxy = (options) => (ip) => {
  const trusted = options.proxies.trusted ?? []
  const untrusted = options.proxies.untrusted ?? []

  if (untrusted.includes('*') || ipRangeCheck(ip, untrusted)) {
    return false
  }

  if (trusted.includes('*') || ipRangeCheck(ip, trusted)) {
    return true
  }

  return true
}

export const getHost = (ip, headers, config) => {
  let host  = null
  const url = new URL(config.get('http.url'))
  const isTrusted = isFromTrustedProxy(config.get('http'))
  const allSubdomainRegex = new RegExp(`^(.+.)?${url.hostname}$`)

  if (isTrusted(ip)) {
    host = (headers['X-Forwarded-Host'] || '').split(',').shift().trim()
  } else if (headers.has('host')) {
    host = headers.host
  } else {
    host = url.hostname
  }

  host = host.trim().replace(/:\d+$/, '').toLowerCase()

  // Validate host name as it comes from user
  if (host.replace(/(?:^\[)?[a-zA-Z0-9-:\]_]+\.?/, '').length) {
    throw new SuspiciousOperationException(`Invalid Host ${host}`)
  }

  if (config.get('http.hosts.onlySubdomain')) {
    if (allSubdomainRegex.test(host)) {
      return host
    }

    throw new SuspiciousOperationException(`Untrusted Host ${host}`)
  }

  if (config.get('http.hosts.trusted', []).length || config.get('http.hosts.trustedPattern', []).length) {
    if (config.get('http.hosts.trusted', []).includes(host)) {
      return host
    }

    if (config.get('http.hosts.trustedPattern', []).reduce((prev, pattern) => pattern.test(host) || prev, false)) {
      return host
    }

    throw new SuspiciousOperationException(`Untrusted Host ${host}`)
  }

  return host
}

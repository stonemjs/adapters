import Busboy from 'busboy'
import typeIs from 'type-is'
import { URL } from 'node:url'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import contentType from 'content-type'
import { randomUUID } from 'node:crypto'
import ipRangeCheck from 'ip-range-check'
import { createWriteStream } from 'node:fs'
import { SuspiciousOperationException, UploadedFile } from '@stone-js/http'

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

export const getFileFromRequest = (req, config) => {
  return new Promise((resolve, reject) => {
    const headers = req.headers
    const result  = { files: {}, fields: {} }
    const busboy  = new Busboy({ headers, ...config.get('http.files', {}) })

    busboy
      .on('close', () => resolve(result))
      .on('error', (error) => reject(error))
      .on('field', (fieldname, value) => {
        result.fields[fieldname] = value
      })
      .on('file', (fieldname, file, info) => {
        result.files[fieldname] ??= []
        const { filename, mimeType } = info
        const filepath = join(tmpdir(), `${config.get('http.files.prefix', 'stone-upload')}-${randomUUID()}`)

        file.on('close', () => {
          result.files[fieldname].push(new UploadedFile(filepath, filename, mimeType))
        })

        file.pipe(createWriteStream(filepath))
      })
    
    if (req.pipe) {
      req.pipe(busboy)
    } else {
      busboy.write(req.body, req.encoding)
      busboy.end()
    }
  })
}

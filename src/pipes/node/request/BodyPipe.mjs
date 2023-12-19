import bytes from 'bytes'
import typeIs from 'type-is'
import rawBody from 'raw-body'
import bodyParser from 'co-body'
import contentType from 'content-type'
import { RuntimeException } from '@stone-js/core'

export class BodyPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (request, req, next) {
    if (!this.#isMultipart(req)) {
      request.body = await this.#getBody(req)
    }

    return next(request, req)
  }

  #isMultipart (req) {
    return typeIs(req, ['multipart']) === 'multipart'
  }

  async #getBody (req) {
    if (!typeIs.hasBody(req)) {
      return {}
    }
    
    const type     = this.#getType(req)
    const encoding = this.#getCharset(req)
    const length   = req.headers['content-length']
    const limit    = bytes.parse(this.#config.get('http.body.limit', '100kb'))

    if (!typeIs(req, type)) {
      return {}
    }

    try {
      switch (typeIs(req, ['urlencoded', 'json', 'text', 'bin'])) {
        case 'bin':
          return await rawBody(req, { length, limit })
        case 'json':
          return await bodyParser.json(req, { limit, encoding })
        case 'text':
          return await bodyParser.text(req, { limit, encoding })
        case 'urlencoded':
          return await bodyParser.form(req, { limit, encoding })
        default:
          return null
      }
    } catch (error) {
      throw new RuntimeException(error.message, error.code, error)
    }
  }

  #getType (req) {
    try {
      return contentType.parse(req).type
    } catch (_) {
      return this.#config.get('http.body.type', 'text/plain')
    }
  }

  #getCharset (req) {
    try {
      return contentType.parse(req).parameters.charset
    } catch (_) {
      return this.#config.get('http.body.defaultCharset', 'utf-8')
    }
  }
}
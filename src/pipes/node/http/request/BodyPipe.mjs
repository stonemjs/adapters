import bytes from 'bytes'
import typeIs from 'type-is'
import rawBody from 'raw-body'
import bodyParser from 'co-body'
import { RuntimeException } from '@stone-js/core'
import { getCharset, getType, isMultipart } from '../../../utils.mjs'

export class BodyPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    if (!isMultipart(passable.req)) {
      passable.request.body = await this.#getBody(passable.req)
    }

    return next(passable)
  }

  async #getBody (req) {
    if (!typeIs.hasBody(req)) {
      return {}
    }

    const type = getType(req, this.#config)
    const encoding = getCharset(req, this.#config)
    const length = req.headers['content-length']
    const limit = bytes.parse(this.#config.get('http.body.limit', '100kb'))

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
}

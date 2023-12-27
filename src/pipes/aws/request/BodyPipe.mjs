import bytes from 'bytes'
import typeIs from 'type-is'
import { Buffer } from 'safe-buffer'
import { RuntimeException } from '@stone-js/core'
import { getCharset, getType, isMultipart } from '../../../utils.mjs'

export class BodyPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    if (!isMultipart(passable.event)) {
      passable.request.body = this.#getBody(passable.event)
    }

    return next(passable)
  }

  #getBody (event) {
    const type = getType(event, this.#config)
    const encoding = getCharset(event, this.#config)
    const limit = bytes.parse(this.#config.get('http.body.limit', '100kb'))

    if (!typeIs(event, type)) {
      return {}
    }
    
    if (Buffer.byteLength(event.body, encoding) > limit) {
      throw new RuntimeException(`Body length exceed the limit ${limit}`)
    }

    return event.body
  }
}

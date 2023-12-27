import typeIs from 'type-is'
import { FileException } from '@stone-js/http'
import { getFileFromRequest, isMultipart } from '../../../utils.mjs'

export class FilesPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    if (isMultipart(passable.event)) {
      const res = await this.#getFiles(passable.event)
      passable.request.files = res.files
      passable.request.body = res.fields
    }

    return next(passable)
  }

  async #getFiles (event) {
    if (!typeIs.hasBody(event)) return {}

    event.encoding = event.encoding || (event.isBase64Encoded ? 'base64' : 'binary')
    event.headers['content-type'] = event.headers['content-type'] || event.headers['Content-Type']

    try {
      return await getFileFromRequest(event, this.#config)
    } catch (error) {
      throw new FileException(error.message, error.code, error)
    }
  }
}

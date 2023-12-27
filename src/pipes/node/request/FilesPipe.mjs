import typeIs from 'type-is'
import { FileException } from '@stone-js/http'
import { getFileFromRequest, isMultipart } from '../../../utils.mjs'

export class FilesPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    if (isMultipart(passable.req)) {
      const res = await this.#getFiles(passable.req)
      passable.request.files = res.files
      passable.request.body = res.fields
    }

    return next(passable)
  }

  async #getFiles (req) {
    if (!typeIs.hasBody(req)) return {}

    try {
      return await getFileFromRequest(req, this.#config)
    } catch (error) {
      throw new FileException(error.message, error.code, error)
    }
  }
}

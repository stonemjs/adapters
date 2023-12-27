import typeIs from 'type-is'
import formidable from 'formidable'
import { isMultipart } from '../../../utils.mjs'
import { FileException, UploadedFile } from '@stone-js/http'

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

    const form = formidable(this.#config.get('http.files', {}))

    try {
      const [fields, files] = await form.parse(req)
      return {
        fields,
        files: files.map(v => new UploadedFile(v.filepath, v.originalFilename, v.mimetype))
      }
    } catch (error) {
      throw new FileException(error.message, error.code, error)
    }
  }
}

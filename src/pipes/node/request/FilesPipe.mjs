import typeIs from 'type-is'
import formidable from 'formidable'
import { FileException, UploadedFile } from '@stone-js/http'

export class FilesPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (request, req, next) {
    if (this.#isMultipart(req)) {
      const res = await this.#getFiles(req)
      request.files = res.files
      request.body = res.fields
    }

    return next(request, req)
  }

  #isMultipart (req) {
    return typeIs(req, ['multipart']) === 'multipart'
  }

  async #getFiles (req) {
    if (!typeIs.hasBody(req) || !this.#isMultipart()) return {}

    const form = formidable(this.#config.get('files', {}))

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

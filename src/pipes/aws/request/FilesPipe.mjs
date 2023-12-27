import Busboy from 'busboy'
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
    if (isMultipart(passable.event)) {
      const res = await this.#getFiles(passable.event)
      passable.request.files = res.files
      passable.request.body = res.fields
    }

    return next(passable)
  }

  async #getFiles (event) {
    if (!typeIs.hasBody(event)) return {}

    const form = formidable(this.#config.get('http.files', {}))

    try {
      const [fields, files] = await this.#parse(event)
      return {
        fields,
        files: files.map(v => new UploadedFile(v.filepath, v.originalFilename, v.mimetype))
      }
    } catch (error) {
      throw new FileException(error.message, error.code, error)
    }
  }

  #parse (event) {
    return new Promise((resolve, reject) => {
      const result   = { files: [], fields: {} }
      const encoding = event.encoding || (event.isBase64Encoded ? 'base64' : 'binary')
      const busboy   = new Busboy({ headers: { 'content-type': event.headers['content-type'] || event.headers['Content-Type'] } })
  
      busboy
        .on('error', error => reject(error))
        .on('finish', () => resolve(result))
        .on('field', (fieldname, value) => { result.fields[fieldname] = value })
        .on('file', (fieldname, file, filename, encoding, mimetype) => {
          const uploadFile = {}

          file.on('data', data => {
            uploadFile.content = data
          })

          file.on('end', () => {
            if (uploadFile.content) {
              uploadFile.filename = filename
              uploadFile.encoding = encoding
              uploadFile.fieldname = fieldname
              uploadFile.contentType = mimetype
              result.files.push(uploadFile)
            }
          })
        })
  
      busboy.write(event.body, encoding)
      busboy.end()
    })
  }
}

import send from 'send'
import statuses from 'statuses'
import onFinished from 'on-finished'
import { BinaryFileResponse, FileException } from '@stone-js/http'

export class SendFilePipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  handler (passable, next) {
    if (passable.response instanceof BinaryFileResponse) {
      passable.res.send = () => this.#sendFile(passable)
    }

    return next(passable)
  }

  #setStatus (res, response) {
    res.statusCode = response.statusCode ?? 500
    res.statusMessage = response.statusMessage ?? statuses.message[500]

    return this
  }

  #setResHeaders (res, response) {
    res.setHeaders(response.headers)

    return this
  }

  #sendFile ({ context, req, res, response }) {
    let streaming
    let done = false

    const file = send(req, response.getEncodedFilePath(), this.#config.get('files', {}))

    const onaborted = () => {
      if (!done) {
        done = true
        const error = new FileException('Request aborted', 'HTTP_FILE-ECONNABORTED')
        this.#handleException({ context, res, error })
      }
    }

    onFinished(res, (error) => {
      if (error && error.code === 'ECONNRESET') return onaborted()
      if (error) return this.#handleException({ context, res, error: new FileException(error.message, `HTTP_FILE-${error.code}`, error) })
      if (done) return

      setImmediate(() => {
        if (!done) {
          if (streaming !== false) {
            return onaborted()
          }
          done = true
        }
      })
    })

    file
      .on('error', (error) => {
        if (!done) {
          done = true
          this.#handleException({ context, res, error: new FileException(error.message, `HTTP_FILE-${error.code}`, error) })
        }
      })
      .on('headers', (res) => {
        this.#setResHeaders(res, response)
      })
      .on('directory', () => {
        if (!done) {
          done = true
          const error = new FileException('EISDIR, read', 'HTTP_FILE-EISDIR')
          this.#handleException({ context, res, error })
        }
      })
      .on('file', () => {
        streaming = false
      })
      .on('stream', () => {
        streaming = true
      })
      .on('end', () => {
        if (!done) {
          done = true
        }
      })
      .pipe(res)

    return this
  }

  async #handleException ({ context, res, exception }) {
    let response = exception

    if (context.has('exceptionHandler')) {
      const handler = context.get('exceptionHandler')
      await handler.report(exception)
      response = handler.render(exception)
    }

    this.#setStatus(res, response)

    res.end(response.message)

    return this
  }
}

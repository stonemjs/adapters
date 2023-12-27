import statuses from 'statuses'
import { BinaryFileResponse } from '@stone-js/http'

export class SendFilePipe {
  handler (passable, next) {
    if (passable.response instanceof BinaryFileResponse) {
      if (passable.request.isMethod('HEAD')) {
        passable.res.send = () => ({
          headers: passable.response.headers,
          statusCode: passable.response.statusCode ?? 500,
          statusMessage: passable.response.statusMessage ?? statuses.message[500]
        })
      } else {
        passable.res.send = () => ({
          headers: passable.response.headers,
          body: passable.response.getFile().getContent(),
          statusCode: passable.response.statusCode ?? 500,
          statusMessage: passable.response.statusMessage ?? statuses.message[500]
        })
      }
    }

    return next(passable)
  }
}

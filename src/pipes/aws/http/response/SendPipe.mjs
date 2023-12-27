import statuses from 'statuses'

export class SendPipe {
  handler (passable, next) {
    if (!passable.res.send) {
      if (passable.request.isMethod('HEAD')) {
        passable.res.send = () => ({
          headers: passable.response.headers,
          statusCode: passable.response.statusCode ?? 500,
          statusMessage: passable.response.statusMessage ?? statuses.message[500]
        })
      } else {
        passable.res.send = () => ({
          body: passable.response.content,
          headers: passable.response.headers,
          statusCode: passable.response.statusCode ?? 500,
          statusMessage: passable.response.statusMessage ?? statuses.message[500]
        })
      }
    }

    return next(passable)
  }
}

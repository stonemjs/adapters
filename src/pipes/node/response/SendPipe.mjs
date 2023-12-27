export class SendPipe {
  handler (passable, next) {
    if (!passable.res.send) {
      if (passable.request.isMethod('HEAD')) {
        passable.res.send = () => passable.res.end()
      } else {
        passable.res.send = () => passable.res.end(passable.response.content, passable.response.charset)
      }
    }

    return next(passable)
  }
}

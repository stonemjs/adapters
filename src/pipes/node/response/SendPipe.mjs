export class SendPipe {
  handler (passable, next) {
    if (passable.request.isMethod('HEAD')) {
      passable.res.send = () => passable.res.end()
    } else if (!passable.res.send) {
      passable.res.send = () => passable.res.end(passable.response.content, passable.response.charset)
    }

    return next(passable)
  }
}

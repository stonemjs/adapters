export class SendPipe {
  handler (passable, next) {
    if (!passable.res.send) {
      passable.res.send = () => passable.response
    }

    return next(passable)
  }
}

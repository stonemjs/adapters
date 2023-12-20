import statuses from 'statuses'

export class HeaderStatusPipe {
  handler (passable, next) {
    this
      .#setStatus(passable.res, passable.response)
      .#setResHeaders(passable.res, passable.response)

    return next(passable)
  }

  #setStatus (res, response) {
    res.statusCode = response.statusCode ?? 500
    res.statusMessage = response.statusMessage ?? statuses.message[500]

    return this
  }

  #setResHeaders (res, response) {
    res.headers = response.headers

    return this
  }
}

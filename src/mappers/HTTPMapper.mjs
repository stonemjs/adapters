import { Request } from '@stone-js/http'
import { Pipeline } from '@stone-js/pipeline'

export class HTTPMapper {
  constructor (container) {
    this._container = container
    this._config    = container.config

    this._requestPipes  = []
    this._responsePipes = []
  }

  request (passable) {
    return new Pipeline(this._container)
      .send({ request: {}, ...passable })
      .through(this._getRequestPipes())
      .then((v) => new Request(v.request))
  }

  response (passable) {
    return new Pipeline(this._container)
      .send(passable)
      .through(this._getResponsePipes())
      .then((v) => v.res)
  }

  _getRequestPipes () {
    return this._requestPipes
  }

  _getResponsePipes () {
    return this._responsePipes
  }
}

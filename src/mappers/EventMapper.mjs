import { Pipeline } from '@stone-js/pipeline'

export class EventMapper {
  constructor (container) {
    this._requestPipes  = []
    this._responsePipes = []
    this._container     = container
    this._config        = container.config
  }

  request (passable) {
    return new Pipeline(this._container)
      .send(passable)
      .through(this._getRequestPipes())
      .then((v) => v.event)
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

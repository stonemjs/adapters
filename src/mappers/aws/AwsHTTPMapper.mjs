import { Request } from '@stone-js/http'
import { Pipeline } from '@stone-js/pipeline'
import { IpPipe } from '../../pipes/aws/request/IpPipe.mjs'
import { CommonPipe } from '../../pipes/aws/request/CommonPipe.mjs'
import { CookiePipe } from '../../pipes/aws/request/CookiePipe.mjs'
import { HeaderStatusPipe } from '../../pipes/aws/response/HeaderStatusPipe.mjs'

export class AwsHTTPMapper {
  #config
  #container

  constructor (container) {
    this.#container = container
    this.#config    = container.config
  }

  request (event, ctx) {
    return new Pipeline(this.#container)
      .send({}, event, ctx)
      .through(this.#getRequestPipes())
      .then((data) => new Request(data))
  }

  response (passable) {
    return new Pipeline(this.#container)
      .send(passable)
      .through(this.#getResponsePipes())
      .then((v) => v.res)
  }

  #getRequestPipes () {
    return [
      IpPipe,
      CommonPipe,
      CookiePipe
    ].concat(this.#config.get('http.aws.adapter.pipes.request', []))
  }

  #getResponsePipes () {
    return [
      HeaderStatusPipe,
    ].concat(this.#config.get('http.aws.adapter.pipes.response', []))
  }
}

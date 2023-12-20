import { Request } from '@stone-js/http'
import { Pipeline } from '@stone-js/pipeline'
import { IpPipe } from '../../pipes/node/request/IpPipe.mjs'
import { HostPipe } from '../../pipes/node/request/HostPipe.mjs'
import { BodyPipe } from '../../pipes/node/request/BodyPipe.mjs'
import { SendPipe } from '../../pipes/node/response/SendPipe.mjs'
import { FilesPipe } from '../../pipes/node/request/FilesPipe.mjs'
import { CommonPipe } from '../../pipes/node/request/CommonPipe.mjs'
import { CookiePipe } from '../../pipes/node/request/CookiePipe.mjs'
import { SendFilePipe } from '../../pipes/node/response/SendFilePipe.mjs'
import { HeaderStatusPipe } from '../../pipes/node/response/HeaderStatusPipe.mjs'

export class NodeHTTPMapper {
  #config
  #container

  constructor (container) {
    this.#container = container
    this.#config    = container.config
  }

  request (req) {
    return new Pipeline(this.#container)
      .send({}, req)
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
      HostPipe,
      BodyPipe,
      FilesPipe,
      CommonPipe,
      CookiePipe,
    ].concat(this.#config.get('http.node.adapter.pipes.request', []))
  }

  #getResponsePipes () {
    return [
      HeaderStatusPipe,
      SendPipe,
      SendFilePipe,
    ].concat(this.#config.get('http.node.adapter.pipes.response', []))
  }
}

import { Request } from '@stone-js/http'
import { Pipeline } from '@stone-js/pipeline'
import { IpPipe } from '../../pipes/node/request/IpPipe.mjs'
import { HostPipe } from '../../pipes/node/request/HostPipe.mjs'
import { BodyPipe } from '../../pipes/node/request/BodyPipe.mjs'
import { FilesPipe } from '../../pipes/node/request/FilesPipe.mjs'
import { CommonPipe } from '../../pipes/node/request/CommonPipe.mjs'
import { CookiePipe } from '../../pipes/node/request/CookiePipe.mjs'
import { SendPipe } from '../../pipes/node/response/SendPipe.mjs'
import { SendFilePipe } from '../../pipes/node/response/SendFilePipe.mjs'
import { HeaderStatusPipe } from '../../pipes/node/response/HeaderStatusPipe.mjs'

export class NodeHTTPMapper {
  #container

  #requestPipes = [
    IpPipe,
    HostPipe,
    BodyPipe,
    FilesPipe,
    CommonPipe,
    CookiePipe,
  ]

  #responsePipes = [
    HeaderStatusPipe,
    SendPipe,
    SendFilePipe,
  ]

  constructor (container) {
    this.#container = container
  }

  request (req) {
    return new Pipeline(this.#container)
      .send({}, req)
      .through(this.#requestPipes)
      .then((data) => new Request(data))
  }

  response (passable) {
    return new Pipeline(this.#container)
      .send(passable)
      .through(this.#responsePipes)
      .then((v) => v.res)
  }
}

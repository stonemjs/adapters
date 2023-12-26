import { HTTPMapper } from '../HTTPMapper.mjs'
import { IpPipe } from '../../pipes/node/request/IpPipe.mjs'
import { HostPipe } from '../../pipes/node/request/HostPipe.mjs'
import { BodyPipe } from '../../pipes/node/request/BodyPipe.mjs'
import { SendPipe } from '../../pipes/node/response/SendPipe.mjs'
import { FilesPipe } from '../../pipes/node/request/FilesPipe.mjs'
import { CommonPipe } from '../../pipes/node/request/CommonPipe.mjs'
import { CookiePipe } from '../../pipes/node/request/CookiePipe.mjs'
import { SendFilePipe } from '../../pipes/node/response/SendFilePipe.mjs'
import { HeaderStatusPipe } from '../../pipes/node/response/HeaderStatusPipe.mjs'

export class NodeHTTPMapper extends HTTPMapper {
  _requestPipes = [
    IpPipe,
    HostPipe,
    BodyPipe,
    FilesPipe,
    CommonPipe,
    CookiePipe,
  ]

  _responsePipes = [
    HeaderStatusPipe,
    SendPipe,
    SendFilePipe,
  ]

  _getRequestPipes () {
    return this._requestPipes.concat(this._config.get('http.node.adapter.pipes.request', []))
  }

  _getResponsePipes () {
    return this._responsePipes.concat(this._config.get('http.node.adapter.pipes.response', []))
  }
}

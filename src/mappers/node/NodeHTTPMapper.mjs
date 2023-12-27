import { HTTPMapper } from '../HTTPMapper.mjs'
import { IpPipe } from '../../pipes/node/http/request/IpPipe.mjs'
import { HostPipe } from '../../pipes/node/http/request/HostPipe.mjs'
import { BodyPipe } from '../../pipes/node/http/request/BodyPipe.mjs'
import { SendPipe } from '../../pipes/node/http/response/SendPipe.mjs'
import { FilesPipe } from '../../pipes/node/http/request/FilesPipe.mjs'
import { CommonPipe } from '../../pipes/node/http/request/CommonPipe.mjs'
import { CookiePipe } from '../../pipes/node/http/request/CookiePipe.mjs'
import { SendFilePipe } from '../../pipes/node/http/response/SendFilePipe.mjs'
import { HeaderStatusPipe } from '../../pipes/node/http/response/HeaderStatusPipe.mjs'

export class NodeHTTPMapper extends HTTPMapper {
  _requestPipes = [
    IpPipe,
    HostPipe,
    BodyPipe,
    FilesPipe,
    CommonPipe,
    CookiePipe
  ]

  _responsePipes = [
    HeaderStatusPipe,
    SendPipe,
    SendFilePipe
  ]

  _getRequestPipes () {
    return this._requestPipes.concat(this._config.get('adapter.http.node.pipe.request', []))
  }

  _getResponsePipes () {
    return this._responsePipes.concat(this._config.get('adapter.http.node.pipe.response', []))
  }
}

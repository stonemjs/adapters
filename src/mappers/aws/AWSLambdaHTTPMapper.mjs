import { HTTPMapper } from '../HTTPMapper.mjs'
import { IpPipe } from '../../pipes/aws/http/request/IpPipe.mjs'
import { HostPipe } from '../../pipes/aws/http/request/HostPipe.mjs'
import { BodyPipe } from '../../pipes/aws/http/request/BodyPipe.mjs'
import { SendPipe } from '../../pipes/aws/http/response/SendPipe.mjs'
import { FilesPipe } from '../../pipes/aws/http/request/FilesPipe.mjs'
import { CommonPipe } from '../../pipes/aws/http/request/CommonPipe.mjs'
import { CookiePipe } from '../../pipes/aws/http/request/CookiePipe.mjs'
import { SendFilePipe } from '../../pipes/aws/http/response/SendFilePipe.mjs'

export class AWSLambdaHTTPMapper extends HTTPMapper {
  _requestPipes = [
    IpPipe,
    HostPipe,
    BodyPipe,
    FilesPipe,
    CommonPipe,
    CookiePipe
  ]

  _responsePipes = [
    SendPipe,
    SendFilePipe
  ]

  _getRequestPipes () {
    return this._requestPipes.concat(this._config.get('adapter.http.aws.lambda.pipe.request', []))
  }

  _getResponsePipes () {
    return this._responsePipes.concat(this._config.get('adapter.http.aws.lambda.pipe.response', []))
  }
}

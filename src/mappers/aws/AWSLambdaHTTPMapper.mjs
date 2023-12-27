import { HTTPMapper } from '../HTTPMapper.mjs'
import { IpPipe } from '../../pipes/aws/request/IpPipe.mjs'
import { HostPipe } from '../../pipes/aws/request/HostPipe.mjs'
import { BodyPipe } from '../../pipes/aws/request/BodyPipe.mjs'
import { SendPipe } from '../../pipes/aws/response/SendPipe.mjs'
import { FilesPipe } from '../../pipes/aws/request/FilesPipe.mjs'
import { CommonPipe } from '../../pipes/aws/request/CommonPipe.mjs'
import { CookiePipe } from '../../pipes/aws/request/CookiePipe.mjs'
import { SendFilePipe } from '../../pipes/aws/response/SendFilePipe.mjs'

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
    SendFilePipe,
  ]

  _getRequestPipes () {
    return this._requestPipes.concat(this._config.get('adapter.http.aws.lambda.pipe.request', []))
  }

  _getResponsePipes () {
    return this._responsePipes.concat(this._config.get('adapter.http.aws.lambda.pipe.response', []))
  }
}

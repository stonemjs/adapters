import { HTTPMapper } from '../HTTPMapper.mjs'
import { IpPipe } from '../../pipes/aws/request/IpPipe.mjs'
import { CommonPipe } from '../../pipes/aws/request/CommonPipe.mjs'
import { CookiePipe } from '../../pipes/aws/request/CookiePipe.mjs'
import { HeaderStatusPipe } from '../../pipes/aws/response/HeaderStatusPipe.mjs'

export class AWSLambdaHTTPMapper extends HTTPMapper {
  _requestPipes = [
    IpPipe,
    CommonPipe,
    CookiePipe,
  ]

  _responsePipes = [
    HeaderStatusPipe,
  ]

  _getRequestPipes () {
    return this._requestPipes.concat(this._config.get('http.aws.lambda.adapter.pipes.request', []))
  }

  _getResponsePipes () {
    return this._responsePipes.concat(this._config.get('http.aws.lambda.adapter.pipes.response', []))
  }
}

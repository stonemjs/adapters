import { EventMapper } from '../EventMapper.mjs'
import { SendPipe } from '../../pipes/aws/event/response/SendPipe.mjs'

export class AWSLambdaEventMapper extends EventMapper {
  _requestPipes  = []

  _responsePipes = [
    SendPipe,
  ]

  _getRequestPipes () {
    return this._requestPipes.concat(this._config.get('adapter.event.aws.lambda.pipe.request', []))
  }

  _getResponsePipes () {
    return this._responsePipes.concat(this._config.get('adapter.event.aws.lambda.pipe.response', []))
  }
}

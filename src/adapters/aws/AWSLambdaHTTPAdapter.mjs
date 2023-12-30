import mime from 'mime'
import accepts from 'accepts'
import statuses from 'statuses'
import { Adapter } from '../Adapter.mjs'
import { AWSLambdaHTTPMapper } from '../../mappers/aws/AWSLambdaHTTPMapper.mjs'

export class AWSLambdaHTTPAdapter extends Adapter {
  #mapper

  constructor (app, configurations = {}) {
    super(app, configurations)

    this.#mapper = new AWSLambdaHTTPMapper(this.context.container)
  }

  async run () {
    return async (event, ctx) => {
      try {
        const request   = await this.#mapper.request({ event, ctx })
        const response  = await this.context.run(request)
        const lambdaRes = await this.#mapper.response({ event, ctx, res: {}, request, response })

        await this.context.stop()

        return lambdaRes
      } catch (error) {
        return this.#handleError(error, event)
      }
    }
  }

  #handleError (error, event) {
    console.error(error)

    const contentType = mime.getType(accepts(event).type(['json', 'html']) ?? 'txt')

    return {
      statusCode: 500,
      statusMessage: statuses.message[500],
      headers: { 'Content-Type': contentType }
    }
  }
}

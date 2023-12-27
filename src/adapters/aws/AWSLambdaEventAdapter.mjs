import { Adapter } from '../Adapter.mjs'
import { AWSLambdaEventMapper } from '../../mappers/aws/AWSLambdaEventMapper.mjs'

export class AWSLambdaEventAdapter extends Adapter {
  #mapper

  constructor (app, configurations = {}) {
    super(app, configurations)

    this.#mapper = new AWSLambdaEventMapper(this.context.container)
  }

  async run () {
    return async (event, ctx) => {
      try {
        event = await this.#mapEvent({ event, ctx })
        const response  = await this.context.run()
        const lambdaRes = await this.#mapper.response({ event, ctx, res: {}, response })

        await this.context.stop()

        return lambdaRes
      } catch (error) {
        return this.#handleError(error, event)
      }
    }
  }

  async #mapEvent (passable) {
    const event = await this.#mapper.request(passable)

    this.context.registerInstance('event', event)
    this.context.registerInstance('sourceContext', passable.ctx)

    return event
  }

  #handleError (error) {
    console.error(error)

    return {
      statusCode: 500
    }
  }
}

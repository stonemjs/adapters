import statuses from 'statuses'
import { Adapter } from '../Adapter.mjs'
import { Request } from '@stone-js/http'
import { AwsHTTPMapper } from '../../mappers/aws/AwsHTTPMapper.mjs'

export class AwsHttpAdapter extends Adapter {
  #mapper

  constructor (app, configurations = {}) {
    super(app, configurations)

    this.#mapper = new AwsHTTPMapper(this.getContext().container)
  }

  async run () {
    return async (event, ctx) => {
      try {
        const context = this.getContext()
        const request = await this.#createRequest(event, ctx)
        const response = await context.run()
        const res = await this.#mapper.response({ event, ctx, res: {}, request, response })
        
        await context.stop()

        return res
      } catch (error) {
        console.error(error)
        return {
          statusCode: 500,
          statusMessage: statuses.message[500],
          headers: { 'Content-Type': 'application/json' }
        }
      }
    }
  }

  async #createRequest (event, ctx) {
    const context = this.getContext()
    const request = await this.#mapper.request(event, ctx)

    request.getEvent = () => event
    request.getContext = () => ctx

    context.registerInstance(Request, request, ['request'])
    context.registerInstance('originalRequest', request.clone())

    return request
  }
}

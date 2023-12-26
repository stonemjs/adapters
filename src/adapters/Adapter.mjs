import { Request } from '@stone-js/http'
import { StoneFactory, LogicException, RuntimeException, isFunction } from '@stone-js/core'

export class Adapter {
  #context
  #configurations

  constructor (app, configurations = {}) {
    if (app instanceof StoneFactory) {
      this.#context = app
    } else if (isFunction(app)) {
      this.#configurations = configurations
      this.#context = StoneFactory.create(app, configurations)
    } else {
      throw new LogicException('The first argument must be an instance of StoneFactory or your AppModule(function or class).')
    }
  }

  static create (app, configurations = {}) {
    return new this(app, configurations)
  }

  get config () {
    return this.#configurations
  }

  get context () {
    return this.#context 
  }

  registerRequest (request) {
    if (request instanceof Request) {
      this.context.registerInstance(Request, request, ['request'])
      this.context.registerInstance('originalRequest', request.clone())
    } else {
      throw new RuntimeException('Request must be an instance of StoneHTTP Request.')
    }

    return this
  }

  run () {
    return this.context.run()
  }
}

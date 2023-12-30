import { StoneFactory, LogicException, isFunction } from '@stone-js/core'

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

  static createAndRun (app, configurations = {}) {
    return new this(app, configurations).run()
  }

  get config () {
    return this.#configurations
  }

  get context () {
    return this.#context
  }

  run () {
    return this.context.run()
  }
}

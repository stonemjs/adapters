import { CookieCollection } from '@stone-js/http'

export class CookiePipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    const options = this.#config.get('http.cookie.options')
    const secret  = this.#config.get('http.cookie.secret', this.#config.get('http.secret'))

    passable.request.cookies = CookieCollection.instance(options, secret).parse(passable.event.cookies ?? [])

    return next(passable)
  }
}

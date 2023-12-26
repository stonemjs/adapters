import { CookieCollection } from '@stone-js/http'

export class CookiePipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (request, event, ctx, next) {
    const options = this.#config.get('http.cookie.options')
    const secret  = this.#config.get('http.cookie.secret', this.#config.get('http.secret'))

    request.cookies = CookieCollection.instance(options, secret).parse(event.cookies ?? [])

    return next(request, event, ctx)
  }
}

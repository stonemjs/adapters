export class CookiePipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (request, req, next) {
    const options = this.#config.get('http.cookie.options')
    const secret  = this.#config.get('http.cookie.secret', this.#config.get('http.secret'))

    request.cookies = CookieCollection.instance(options, secret).parse(req.headers.cookie)

    return next(request, req)
  }
}
import { URL } from 'node:url'
import { getHost } from '../../../utils.mjs'

export class HostPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    const url = this.#getUrl(passable.req)

    passable.request.url = url
    passable.request.queryString = url.search

    return next(passable)
  }

  #getUrl (req) {
    const host = getHost(req.socket.remoteAddress, req.headers, this.#config)
    return new URL(req.url, `http://${host}`)
  }
}

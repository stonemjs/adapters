import { URL } from 'node:url'
import { getHost } from '../../../utils.mjs'

export class HostPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    const url = this.#getUrl(passable.event)

    passable.request.url = url

    return next(passable)
  }

  #getUrl (event) {
    const remoteAddress = event.requestContext?.identity?.sourceIp ?? event.requestContext?.http?.sourceIp
    const host = getHost(remoteAddress, event.headers, this.#config)
    return new URL(req.url, `http://${host}`)
  }
}

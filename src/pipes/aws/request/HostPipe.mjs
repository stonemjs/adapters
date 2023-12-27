import { URL } from 'node:url'
import { getHost } from '../../../utils.mjs'

export class HostPipe {
  #config

  constructor ({ config }) {
    this.#config = config
  }

  async handler (passable, next) {
    passable.request.url = this.#getUrl(passable.event)

    return next(passable)
  }

  #getUrl (event) {
    const remoteAddress = event.requestContext?.identity?.sourceIp ?? event.requestContext?.http?.sourceIp
    const host = getHost(remoteAddress, event.headers, this.#config)
    return new URL(event.path ?? event.rawPath ?? '/', `http://${host}`)
  }
}

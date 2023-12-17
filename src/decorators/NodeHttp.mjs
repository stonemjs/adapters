import { Adapter } from './Adapter.mjs'
import { NODE_HTTP_PLATFORM } from '../constants.mjs'

/**
 * NodeHttp Decorator: Useful for customizing classes to ensure applications run smoothly on node.js platforms.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @memberOf Decorators
 * @param  {adapterOptions} options
 * @return {Function}
 */
export const NodeHttp = (options) => {
  return Adapter({ ...options, current: NODE_HTTP_PLATFORM })
}

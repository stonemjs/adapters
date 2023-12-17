import { Adapter } from './Adapter.mjs'
import { NODE_CONSOLE_PLATFORM } from '../constants.mjs'

/**
 * NodeConsole Decorator: Useful for customizing classes to ensure applications run smoothly on node.js platforms.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @memberOf Decorators
 * @param  {adapterOptions} options
 * @return {Function}
 */
export const NodeConsole = (options) => {
  return Adapter({ ...options, current: NODE_CONSOLE_PLATFORM })
}

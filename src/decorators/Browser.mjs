import { Adapter } from './Adapter.mjs'
import { BROWSER_PLATFORM } from '../constants.mjs'

/**
 * Browser Decorator: Useful for customizing classes to ensure applications run smoothly on Browser.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @memberOf Decorators
 * @param  {adapterOptions} options
 * @return {Function}
 */
export const Browser = (options) => {
  return Adapter({ ...options, current: BROWSER_PLATFORM })
}

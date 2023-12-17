import deepmerge from 'deepmerge'
import { isClass } from '@stone-js/common'

/**
 * Interface for representing a Middleware.
 *
 * @typedef  Middlewareable
 * @property {Function} handle - Will be invoked by the pipeline.
 */

/**
 * Decorators, usefull for decorating classes.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @namespace Decorators
 */

/**
 * Adapter options.
 *
 * @typedef  {Object} adapterOptions
 * @property {Object} middleware
 * @property {(Middlewareable[]|string[])} middleware.input
 * @property {(Middlewareable[]|string[])} middleware.output
 * @property {Object} resolver
 * @property {Function} resolver.input
 * @property {Function} resolver.output
 * @property {string} current - Current adapter alias name.
 */

/**
 * Adapter Decorator: Useful for customizing classes to ensure applications run smoothly on specific platforms.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @memberOf Decorators
 * @param  {adapterOptions} options
 * @return {Function}
 */
export const Adapter = (options) => {
  return (target) => {
    if (!isClass(target)) {
      throw new TypeError('This decorator can only be applied at class level.')
    }

    const metadata = {
      adapter: options
    }

    target.$$metadata$$ = deepmerge(target.$$metadata$$ ?? {}, metadata)

    return target
  }
}

import { NODE_HTTP_PLATFORM } from '../constants.mjs'
import { classLevelDecoratorChecker, merge } from '@stone-js/common'
import { nodeHttpAdapterOptions } from '@stone-js/node-adapter/config'

/**
 * Interface for representing a Middleware.
 *
 * @typedef  Middlewareable
 * @property {Function} handle - Will be invoked by the pipeline.
 */

/**
 * Decorators, Useful for decorating classes.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @namespace Decorators
 */

/**
 * NodeHttp options.
 *
 * @typedef  {Object} adapterOptions
 * @property {string} [url]
 * @property {string} [alias]
 * @property {boolean} [default]
 * @property {Object} [middleware]
 * @property {(Middlewareable[]|string[])} [middleware.input]
 * @property {(Middlewareable[]|string[])} [middleware.output]
 */

/**
 * NodeHttp adapter Decorator: Useful for customizing classes to ensure applications run smoothly on specific platforms.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @memberOf Decorators
 * @param  {adapterOptions} [options]
 * @return {Function}
 */
export const NodeHttpAdapter = (options = {}) => {
  return (target) => {
    classLevelDecoratorChecker(target)

    const metadata = {
      adapters: [
        merge(nodeHttpAdapterOptions.adapters[0], {
          app: {
            adapter: {
              default: options.default ?? false,
              url: options.url ?? 'http://localhost:8080',
              alias: options.alias ?? NODE_HTTP_PLATFORM
            },
            mapper: {
              input: {
                middleware: options.middleware?.input ?? []
              },
              output: {
                middleware: options.middleware?.output ?? []
              }
            }
          }
        })
      ]
    }

    target.$$metadata$$ = merge(target.$$metadata$$ ?? {}, metadata)

    return target
  }
}

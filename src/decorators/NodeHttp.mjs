import deepmerge from 'deepmerge'
import { NODE_HTTP_PLATFORM } from '@stone-js/adapters'
import { nodeHttpOptions } from '@stone-js/adapters/config'
import { classLevelDecoratorChecker } from '@stone-js/common'

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
 * NodeHttp options.
 *
 * @typedef  {Object} adapterOptions
 * @property {string} url
 * @property {string} alias
 * @property {Object} middleware
 * @property {(Middlewareable[]|string[])} middleware.input
 * @property {(Middlewareable[]|string[])} middleware.output
 */

/**
 * NodeHttp Decorator: Useful for customizing classes to ensure applications run smoothly on specific platforms.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @memberOf Decorators
 * @param  {adapterOptions} options
 * @return {Function}
 */
export const NodeHttp = (options = {}) => {
  return (target) => {
    classLevelDecoratorChecker(target)

    const metadata = {
      adapters: [
        deepmerge(nodeHttpOptions.adapters[0], {
          app: {
            adapter: {
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

    target.$$metadata$$ = deepmerge(target.$$metadata$$ ?? {}, metadata)

    return target
  }
}

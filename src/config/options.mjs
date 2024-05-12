import { IncomingHttpEvent } from '@stone-js/http'
import {
  Mapper,
  IpMiddleware,
  BodyMiddleware,
  HostMiddleware,
  SendMiddleware,
  FilesMiddleware,
  NodeHTTPAdapter,
  CommonMiddleware,
  SendFileMiddleware,
  NODE_HTTP_PLATFORM,
  HeaderStatusMiddleware
} from '@stone-js/adapters'

/**
 * Console options.
 *
 * @returns {Object}
*/
export const nodeHttpOptions = {
  // Adapters namespace
  adapters: [{
    // App namespace
    app: {

      // Adapter options to be merged with global adapter options.
      adapter: {

        // Here you can define your adapter alias name.
        alias: NODE_HTTP_PLATFORM,

        // Here you can define your default adapter
        default: true,

        // Adapter class constructor.
        type: NodeHTTPAdapter,

        // Base url to run the app.
        url: 'http://localhost:8080',

        // Node server configs
        server: {}
      },

      // Adapter mapper options.
      mapper: {

        // Input mapper options
        // Use this mapper for incomming platform event.
        input: {

          // Mapper class constructor.
          type: Mapper,

          // Input mapper resolve
          resolver: (passable) => IncomingHttpEvent.create(passable.event),

          // Input mapper middleware. Can be class constructor or alias.
          // Middleware must be registered before using it in the app middleware array.
          middleware: [BodyMiddleware, CommonMiddleware, FilesMiddleware, HostMiddleware, IpMiddleware]
        },

        // Output mapper options
        // Use this mapper for outgoing app response.
        output: {

          // Mapper class constructor.
          type: Mapper,

          // Output mapper resolve
          resolver: (passable) => passable.response,

          // Output mapper middleware. Can be class constructor or alias.
          // Middleware must be registered before using it in the app middleware array.
          middleware: [HeaderStatusMiddleware, SendFileMiddleware, SendMiddleware]
        }
      }
    }
  }]
}

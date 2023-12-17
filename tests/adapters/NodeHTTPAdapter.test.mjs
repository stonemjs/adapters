import { HttpError } from '@stone-js/common'
import { NodeHTTPAdapter } from '../../../src/adapters/node/NodeHTTPAdapter.mjs'
const adapterOptions = {}
const server = {
  createServer: (_, listener) => ({
    listener,
    onClose: null,
    status: 'idle',
    listen (_a, _b, cb) {
      this.status !== 'error' && cb()
      this.onClose?.()
      return this
    },
    once (event, cb) {
      const error = { message: 'cannot run server' }
      this.status === event && cb(error)
      return this
    },
    close (cb) {
      this.onClose = cb
    }
  })
}
jest.mock('node:http', () => server)
jest.mock('node:https', () => server)
jest.mock('statuses', () => ({ message: {} }))
jest.mock('mime', () => ({ getType: jest.fn() }))
jest.mock('accepts', () => () => ({ type: jest.fn() }))
jest.mock('on-finished', () => async (_, cb) => await cb())

const methodMiddleware = (passable, next) => {
  passable.event.method = passable.message.method
  return next(passable)
}

const SendMiddleware = class {
  constructor ({ config }) {
    this.type = config.get('body.defaultType', 'application/json')
  }

  handle (passable, next) {
    passable.result.type = this.type
    passable.response.send = () => passable.response.end(passable.result)
    return next(passable)
  }
}

jest.mock('../../../src/middleware/node/http/index.mjs', () => ({
  inputMiddleware: [methodMiddleware],
  outputMiddleware: [SendMiddleware]
}))

describe('NodeHTTPAdapter', () => {
  const processEvents = {}

  describe('#createAndRun', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      globalThis.window = undefined
      globalThis.process.on = jest.fn((event, cb) => {
        processEvents[event] = cb
        return globalThis.process
      })
      globalThis.process.exit = jest.fn()
      globalThis.process.abort = jest.fn()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
      globalThis.process.on.mockRestore()
      globalThis.process.exit.mockRestore()
      globalThis.process.abort.mockRestore()
    })

    it('Must throw an error when adapter is running in a browser', async () => {
      try {
        // Act
        globalThis.window = {}
        expect(await new NodeHTTPAdapter().run(() => {})).toBeTruthy()
      } catch (error) {
        // Assert
        expect(error.message).toBe('This `NodeHTTPAdapter` must be used only in node.js context.')
      }
    })

    it('Must intercept error when node server not running', async () => {
      // Arrange
      const app = (event, { platform }) => {
        return { method: event.method, platform }
      }
      const adapter = new NodeHTTPAdapter({ baseUrl: 'https://localhost:9090' })
      adapter.context.server.status = 'error'
      adapter.setLogger({ error: jest.fn() })

      try {
        // Act
        expect(await adapter.run(app)).toBeTruthy()
      } catch (error) {
        // Assert
        expect(error.message).toBe('cannot run server')
        expect(adapter.logger.error).toHaveBeenCalledWith({ message: 'cannot run server' }, 'An unexpected error has occurred.')
      }
    })

    it('Must intercept error when app throw an error', async () => {
      // Arrange
      const app = () => {
        throw new HttpError(null, 'Bad request', 'Invalid name', { headers: new Headers({ 'content-type': 'application/json' }) })
      }
      const adapter = new NodeHTTPAdapter({ baseUrl: 'https://localhost:9090' })
      const message = { method: 'GET' }
      const response = { end: jest.fn(), setHeader: jest.fn() }
      adapter.setErrorHandler({ report: jest.fn(), render: jest.fn() })

      // Act
      await adapter.run(app)
      await adapter.context.server.listener(message, response)

      // Assert
      expect(response.end).toHaveBeenCalled()
      expect(response.setHeader).toHaveBeenCalledTimes(2)
      expect(adapter.errorHandler.report).toHaveBeenCalled()
      expect(adapter.errorHandler.render).toHaveBeenCalled()
    })

    it('Must log uncaughtException with `error` level and exit smoothly', async () => {
      // Arrange
      const error = new Error('error')
      const adapter = new NodeHTTPAdapter()
      adapter.setLogger({ error: jest.fn(), info: jest.fn() })
      adapter.hooks({ onInit: [() => processEvents.uncaughtException(error)] })

      // Act
      await adapter.run(() => {})
      jest.runAllTimers()

      // Assert
      expect(globalThis.process.abort).toHaveBeenCalled()
      expect(globalThis.process.exit).toHaveBeenCalledWith(1)
      expect(adapter.logger.error).toHaveBeenCalledWith(error, 'Uncaught exception detected.')
    })

    it('Must log uncaughtException with `fatal` level and exit smoothly', async () => {
      // Arrange
      const error = new Error('error')
      const adapter = new NodeHTTPAdapter()
      adapter.setLogger({ fatal: jest.fn(), info: jest.fn() })
      adapter.hook('onInit', () => processEvents.uncaughtException(error))

      // Act
      await adapter.run(() => {})
      jest.runAllTimers()

      // Assert
      expect(globalThis.process.abort).toHaveBeenCalled()
      expect(globalThis.process.exit).toHaveBeenCalledWith(1)
      expect(adapter.logger.fatal).toHaveBeenCalledWith(error, 'Uncaught exception detected.')
    })

    it('Must log unhandledRejection with `error` level', async () => {
      // Arrange
      const adapter = new NodeHTTPAdapter()
      adapter.setLogger({ error: jest.fn(), info: jest.fn() })
      adapter.hook('onInit', () => processEvents.unhandledRejection('reason', 'promise'))

      // Act
      await adapter.run(() => {})
      jest.runAllTimers()

      // Assert
      expect(globalThis.process.exit).not.toHaveBeenCalled()
      expect(globalThis.process.abort).not.toHaveBeenCalled()
      expect(adapter.logger.error).toHaveBeenCalledWith('Unhandled Rejection at: promise, reason: reason')
    })

    it('Must run function defined app with the node http adapter', async () => {
      // Arrange
      const app = (event, { platform }) => {
        return { method: event.method, platform }
      }
      const adapter = new NodeHTTPAdapter(adapterOptions)
      const message = { method: 'GET' }
      const response = { end: jest.fn(), setHeader: jest.fn() }
      adapter.setLogger({ info: jest.fn() })

      // Act
      await adapter.run(app)
      await adapter.context.server.listener(message, response)

      // Assert
      expect(adapter.logger.info).toHaveBeenCalledWith('Server started at: http://localhost:8080/')
      expect(response.end).toHaveBeenCalledWith({ method: 'GET', platform: 'node_http', type: 'text/plain' })
    })

    it('Must run class defined app with the node http adapter', async () => {
      // Arrange
      class App {
        handle (event, { platform }) {
          return { method: event.method, platform }
        }
      }
      const adapter = new NodeHTTPAdapter({ baseUrl: 'https://localhost:9090' })
      const message = { method: 'GET' }
      const response = { end: jest.fn(), setHeader: jest.fn() }
      adapter.setLogger({ info: jest.fn() })

      // Act
      await adapter.run(new App())
      await adapter.context.server.listener(message, response)

      // Assert
      expect(adapter.logger.info).toHaveBeenCalledWith('Server started at: https://localhost:9090/')
      expect(response.end).toHaveBeenCalledWith({ method: 'GET', platform: 'node_http', type: 'application/json' })
    })
  })
})

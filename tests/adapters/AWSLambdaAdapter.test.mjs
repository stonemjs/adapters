import statuses from 'statuses'
import { Config } from '@stone-js/config'
import { Mapper } from '../../src/Mapper.mjs'
import { Container } from '@stone-js/service-container'
import { AWSLambdaAdapter } from '../../src/adapters/AWSLambdaAdapter.mjs'

// const methodMiddleware = (passable, next) => {
//   passable.event.method = passable.message.method
//   return next(passable)
// }
const HttpError = {}
const SendMiddleware = class {
  constructor ({ config }) {
    this.type = config.get('body.defaultType', 'application/json')
  }

  handle (passable, next) {
    passable.result.type = this.type
    passable.response.send = () => ({
      statusCode: 200,
      body: passable.result
    })
    return next(passable)
  }
}

describe('AWSLambdaAdapter', () => {
  const config = Config.create({})
  const container = new Container()
  const outputMapper = Mapper.create(container, [SendMiddleware], (passable) => passable.response)

  describe('#createAndRun', () => {
    beforeEach(() => {
      container.instance(Config, config).alias(Config, 'config')
    })
    afterEach(() => {
      config.clear()
      container.clear()
    })

    it('Must throw an error when adapter is running in a browser', async () => {
      try {
        // Act
        globalThis.window = {}
        expect(await new AWSLambdaAdapter(container).run(() => {})).toBeTruthy()
      } catch (error) {
        // Assert
        expect(error.message).toBe('This `AWSLambdaAdapter` must be used only in node.js context.')
      }
    })

    it('Must intercept error when app throw an error', async () => {
      // Arrange
      const app = (_request) => {
        throw new HttpError(null, 'Bad request', 'Invalid name', { headers: new Headers({ 'content-type': 'application/json' }) })
      }
      const body = { status: 500, message: 'An unexpected error has occurred.' }
      const adapter = new AWSLambdaAdapter({ baseUrl: 'https://localhost:9090', debug: true })
      const message = { method: 'GET' }
      adapter.setErrorHandler({ report: jest.fn(), render: jest.fn(() => body) })

      // Act
      const handler = await adapter.run(app)
      const response = await handler(message, {})

      // Assert
      expect(adapter.errorHandler.report).toHaveBeenCalled()
      expect(adapter.errorHandler.render).toHaveBeenCalled()
      expect(response).toEqual({
        statusCode: 500,
        body: JSON.stringify(body),
        statusMessage: statuses.message[500],
        headers: { 'content-type': 'application/json' }
      })
    })

    it('Must run function defined app with the default adapter', async () => {
      // Arrange
      const terminate = jest.fn()
      const app = (event, { config }) => {
        return { uri: event.uri, name: config.get('app.name'), version: config.get('app.version') }
      }
      const adapter = AWSLambdaAdapter
        .create(container, null, outputMapper)
        .hook('onInit', ({ config }) => config.set('app.name', 'Stone.js'))
        .hook('beforeHandle', ({ config }) => config.set('app.version', '1.0.0'))
        .hook('onTerminate', ({ config }) => terminate(config.get('app')))

      // Act
      const response = await adapter.run(app)

      // Assert
      expect(adapter.executionDuration).not.toBeUndefined()
      expect(terminate).toHaveBeenCalledWith({ name: 'Stone.js', version: '1.0.0' })
      expect(response).toEqual({ uri: undefined, name: 'Stone.js', version: '1.0.0' })
    })

    it('Must run class defined app with the default adapter', async () => {
      // Arrange
      const terminate = jest.fn()
      class App {
        onInit ({ config }) {
          config.set('app.name', 'Stone.js')
        }

        beforeHandle ({ config }) {
          config.set('app.version', '1.0.0')
        }

        onTerminate ({ config }) {
          terminate(config.get('app'))
        }

        handle (event, { config }) {
          config.set('app.terminate', 'Bye!')
          return { uri: event.uri, type: 'text/plain', name: config.get('app.name'), version: config.get('app.version') }
        }
      }
      const UriMiddleware = (passable, next) => {
        passable.event.uri = 'http://localhost:8080/'
        return next(passable)
      }
      const inputMapper = Mapper.create(container, [UriMiddleware], (passable) => passable.event)

      // Act
      const response = await AWSLambdaAdapter.createAndRun(container, new App(), inputMapper, outputMapper)

      // Assert
      expect(response).toEqual({ uri: 'http://localhost:8080/', type: 'text/plain', name: 'Stone.js', version: '1.0.0' })
      expect(terminate).toHaveBeenCalledWith({ name: 'Stone.js', version: '1.0.0', terminate: 'Bye!' })
    })
  })
})

import { Config } from '@stone-js/config'
import { Mapper } from '../../src/Mapper.mjs'
import { Container } from '@stone-js/service-container'
import { Adapter } from '../../src/adapters/Adapter.mjs'

describe('Adapter', () => {
  const config = Config.create({})
  const container = new Container()
  const SendMiddleware = (passable, next) => {
    passable.response.send = () => passable.result
    return next(passable)
  }
  const outputMapper = Mapper.create(container, [SendMiddleware], (passable) => passable.response)

  describe('#createAndRun', () => {
    beforeEach(() => {
      container.instance(Config, config).alias(Config, 'config')
    })
    afterEach(() => {
      config.clear()
      container.clear()
    })

    it('Must throw an error when handler is netheir a function nor an object', async () => {
      try {
        // Act
        expect(new Adapter(container)).toBeTruthy()
        expect(Adapter.create(container)).toBeTruthy()
        expect(await Adapter.createAndRun(container, 'app')).toBeTruthy()
      } catch (error) {
        // Assert
        expect(error.message).toBe('The `handler` must be a function or an object.')
      }
    })

    it('Must handle handler exception', async () => {
      // Arrange
      const app = () => {
        throw new Error('Error')
      }
      const logger = { error: jest.fn() }
      container.instance('logger', logger)
      container.instance('errorHandler', {})
      // Act
      const response = await Adapter.createAndRun(container, app)
      // Assert
      expect(response).toBeUndefined()
      expect(logger.error).toHaveBeenCalled()
    })

    it('Must run function defined app with the default adapter', async () => {
      // Arrange
      const terminate = jest.fn()
      const app = (event, { config }) => {
        return { uri: event.uri, name: config.get('app.name'), version: config.get('app.version') }
      }
      const adapter = Adapter
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
      const response = await Adapter.createAndRun(container, new App(), inputMapper, outputMapper)

      // Assert
      expect(response).toEqual({ uri: 'http://localhost:8080/', type: 'text/plain', name: 'Stone.js', version: '1.0.0' })
      expect(terminate).toHaveBeenCalledWith({ name: 'Stone.js', version: '1.0.0', terminate: 'Bye!' })
    })
  })
})

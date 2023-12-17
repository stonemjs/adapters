import { Config } from '@stone-js/config'
import { AppRunner } from '../src/AppRunner.mjs'
import { Adapter } from '../src/adapters/Adapter.mjs'
import { Container } from '@stone-js/service-container'

describe('AppRunner', () => {
  const SendMiddleware = (passable, next) => {
    passable.response.send = () => passable.result
    return next(passable)
  }

  describe('#createAndRun', () => {
    it('Must throw an error when running and when no adapters are provided', async () => {
      try {
        expect(new AppRunner()).toBeTruthy()
        expect(AppRunner.create()).toBeTruthy()
        expect(await AppRunner.createAndRun(() => {})).toBeTruthy()
      } catch (error) {
        expect(error.message).toBe('No adapters provided.')
      }
    })

    it('Must return undefined when expecting for a value and no send middleware are defined', async () => {
      // Arrange
      const app = (event) => {
        return { uri: event.uri ?? 'http://localhost:8080' }
      }
      const options = {
        adapters: [{
          name: 'default',
          adapter: Adapter
        }],
        fallback: 'default',
        current: 'node_http'
      }
      const config = Config.create()
      const container = new Container().instance(Config, config).alias(Config, 'config')
      const adapter = AppRunner.create(container, options)

      // Act
      const response = await adapter.run(app)

      // Assert
      expect(response).toBeUndefined()
    })

    it('Must run function defined app with the fallback adapter', async () => {
      // Arrange
      const terminate = jest.fn()
      const app = (event, { config }) => {
        return { uri: event.uri, name: config.get('app.name'), version: config.get('app.version') }
      }
      const options = {
        adapters: [{
          name: 'default',
          adapter: Adapter,
          mapper: {
            output: {
              middleware: [SendMiddleware],
              resolver: (passable) => passable.response
            }
          }
        }],
        fallback: 'default',
        current: 'node_http'
      }
      const config = Config.create()
      const container = new Container().instance(Config, config).alias(Config, 'config')
      const adapter = AppRunner
        .create(container, options)
        .hook('onInit', ({ config }) => config.set('app.name', 'Stone.js'))
        .hook('beforeHandle', ({ config }) => config.set('app.version', '1.0.0'))
        .hook('onTerminate', ({ config }) => terminate(config.get('app')))

      // Act
      const response = await adapter.run(app)

      // Assert
      expect(terminate).toHaveBeenCalledWith({ name: 'Stone.js', version: '1.0.0' })
      expect(response).toEqual({ uri: undefined, name: 'Stone.js', version: '1.0.0' })
    })

    it('Must run class defined app with the current adapter', async () => {
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
      const options = {
        adapters: [{
          name: 'node_http',
          adapter: Adapter,
          mapper: {
            input: {
              middleware: [UriMiddleware],
              resolver: (passable) => passable.event
            },
            output: {
              middleware: [SendMiddleware],
              resolver: (passable) => passable.response
            }
          }
        }],
        fallback: 'default',
        current: 'node_http'
      }

      // Act
      const config = Config.create()
      const container = new Container().instance(Config, config).alias(Config, 'config')
      const response = await AppRunner.createAndRun(container, new App(), options)

      // Assert
      expect(response).toEqual({ uri: 'http://localhost:8080/', type: 'text/plain', name: 'Stone.js', version: '1.0.0' })
      expect(terminate).toHaveBeenCalledWith({ name: 'Stone.js', version: '1.0.0', terminate: 'Bye!' })
    })
  })
})

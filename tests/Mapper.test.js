import { Config } from '@stone-js/config'
import { Mapper } from '../src/Mapper.mjs'
import { Container } from '@stone-js/service-container'

describe('Mapper', () => {
  describe('#map', () => {
    it('Must transform input by adding new props from middleware', async () => {
      // Arrange
      const IPMiddleware = (passable, next) => {
        passable.event.ip = '127.0.0.1'
        return next(passable)
      }
      const HostMiddleware = class {
        constructor ({ config }) {
          this.hostname = config.hostname
        }

        handle (passable, next) {
          passable.event.hostname = this.hostname
          return next(passable)
        }
      }
      const config = Config.create({ hostname: 'stonejs.com' })
      const container = new Container().instance(Config, config).alias(Config, 'config')
      const mapper = Mapper.create(container, [HostMiddleware, IPMiddleware], (passable) => passable)

      // Act
      const result = await mapper.map({})

      // Assert
      expect(result).toEqual({ event: { ip: '127.0.0.1', hostname: 'stonejs.com' }, response: {} })
    })
  })
})

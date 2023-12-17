import { BrowserAdapter } from '../../../src/adapters/browser/BrowserAdapter.mjs'

describe('BrowserAdapter', () => {
  describe('#createAndRun', () => {
    it('Must throw an error when adapter is running out of browser', async () => {
      try {
        globalThis.window = undefined
        expect(await BrowserAdapter.createAndRun(() => {})).toBeTruthy()
      } catch (error) {
        expect(error.message).toBe('This `BrowserAdapter` must be used only in browser context.')
      }
    })

    it('Must run function defined app with the browser adapter', async () => {
      // Arrange
      const terminate = jest.fn()
      globalThis.window = { location: new URL('http://localhost:8080') }
      const app = (event, { config, platform }) => {
        return { uri: event.uri, platform, name: config.get('app.name'), version: config.get('app.version') }
      }
      const adapter = new BrowserAdapter()
        .hook('onInit', ({ config }) => config.set('app.name', 'Stone.js'))
        .hook('beforeHandle', ({ config }) => config.set('app.version', '1.0.0'))
        .hook('onTerminate', ({ config }) => terminate(config.get('app')))

      // Act
      const response = await adapter.run(app)

      // Assert
      expect(terminate).toHaveBeenCalledWith({ name: 'Stone.js', version: '1.0.0' })
      expect(response).toEqual({ uri: 'http://localhost:8080/', platform: 'browser', name: 'Stone.js', version: '1.0.0' })
    })
  })
})

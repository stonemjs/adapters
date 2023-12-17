import { NodeConsoleAdapter } from '../../../src/adapters/node/NodeConsoleAdapter.mjs'

jest.mock('ora', () => jest.fn())
jest.mock('chalk', () => jest.fn())
jest.mock('yargs/helpers', () => ({ hideBin: jest.fn() }))
jest.mock('inquirer', () => ({ createPromptModule: jest.fn() }))
jest.mock('yargs', () => jest.fn(() => ({
  argv: {
    _: ['user', 'profile'],
    $0: 'file',
    name: 'Stone.js',
    version: '1.0.0'
  }
})))

describe('NodeConsoleAdapter', () => {
  const processEvents = {}

  beforeEach(() => {
    jest.useFakeTimers()
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

  describe('#createAndRun', () => {
    it('Must throw an error when adapter is running in a browser', async () => {
      try {
        globalThis.window = {}
        expect(await NodeConsoleAdapter.createAndRun(() => {})).toBeTruthy()
      } catch (error) {
        expect(error.message).toBe('This `NodeConsoleAdapter` must be used only in node.js context.')
      }
    })

    it('Must log uncaughtException with `error` level and exit smoothly', async () => {
      // Arrange
      globalThis.window = undefined
      const error = new Error('error')
      const adapter = new NodeConsoleAdapter()
      adapter.setLogger({ error: jest.fn() })
      adapter.hook('onTerminate', () => processEvents.uncaughtException(error))

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
      globalThis.window = undefined
      const error = new Error('error')
      const adapter = new NodeConsoleAdapter()
      adapter.setLogger({ fatal: jest.fn() })
      adapter.hook('onTerminate', () => processEvents.uncaughtException(error))

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
      globalThis.window = undefined
      const adapter = new NodeConsoleAdapter()
      adapter.setLogger({ error: jest.fn() })
      adapter.hook('onTerminate', () => processEvents.unhandledRejection('reason', 'promise'))

      // Act
      await adapter.run(() => {})
      jest.runAllTimers()

      // Assert
      expect(globalThis.process.exit).not.toHaveBeenCalled()
      expect(globalThis.process.abort).not.toHaveBeenCalled()
      expect(adapter.logger.error).toHaveBeenCalledWith('Unhandled Rejection at: promise, reason: reason')
    })

    it('Must run function defined app with the node console adapter', async () => {
      // Arrange
      globalThis.window = undefined
      const app = (event, { platform }) => {
        return { uri: event.uri, platform, name: event.get('name'), version: event.get('version'), extra: event.get('_extra').join(',') }
      }
      const adapter = new NodeConsoleAdapter()

      // Act
      const response = await adapter.run(app)

      // Assert
      expect(response).toEqual({ uri: 'http://localhost:8080/user', platform: 'node_console', name: 'Stone.js', version: '1.0.0', extra: 'profile' })
    })
  })
})

import { NodeConsole } from '../../src/decorators/NodeConsole.mjs'
import { NodeConsoleAdapter } from '../../src/adapters/NodeConsoleAdapter.mjs'

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

const Application = class {
  handle (event, { logger }) {
    logger.debug('Hello', event)
  }
}

describe('NodeConsole', () => {
  it('Must return a class with `$$metadata$$` as static property and current value as `NodeConsoleAdapter`', () => {
    // Arrange
    const options = { handler: 'handle' }

    // Act
    const result = NodeConsole(options)(Application)

    // Assert
    expect(result.$$metadata$$).toBeTruthy()
    expect(result.$$metadata$$.adapter.options.handler).toBe('handle')
    expect(result.$$metadata$$.adapter.current).toEqual(NodeConsoleAdapter)
  })
})

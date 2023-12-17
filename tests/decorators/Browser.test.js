import { Browser } from '../../src/decorators/Browser.mjs'
import { BrowserAdapter } from '../../src/adapters/BrowserAdapter.mjs'

const Application = class {
  handle (event, { logger }) {
    logger.debug('Hello', event)
  }
}

describe('Browser', () => {
  it('Must return a class with `$$metadata$$` as static property and current value as `BrowserAdapter`', () => {
    // Arrange
    const options = { handler: 'handle' }

    // Act
    const result = Browser(options)(Application)

    // Assert
    expect(result.$$metadata$$).toBeTruthy()
    expect(result.$$metadata$$.adapter.options.handler).toBe('handle')
    expect(result.$$metadata$$.adapter.current).toEqual(BrowserAdapter)
  })
})

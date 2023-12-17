import { AppRunner } from '../../src/AppRunner.mjs'
import { Runner } from '../../src/decorators/Runner.mjs'

const Application = class {
  handle (event, { logger }) {
    logger.debug('Hello', event)
  }
}

describe('Runner', () => {
  it('Must throw an exception when target is not a class', () => {
    try {
      // Act
      Runner({})(Application.prototype)
    } catch (error) {
      // Assert
      expect(error.message).toBe('This decorator can only be applied at class level.')
    }
  })
  it('Must return a class with `$$metadata$$` as static property and current value as `AppRunner`', () => {
    // Arrange
    const options = { adapters: [] }

    // Act
    const result = Runner(options)(Application)

    // Assert
    expect(result.$$metadata$$).toBeTruthy()
    expect(result.$$metadata$$.runner.current).toEqual(AppRunner)
    expect(result.$$metadata$$.runner.options.adapters).toEqual([])
  })
})

import { Adapter } from '../../src/decorators/Adapter.mjs'

const Application = class {
  handle (event, { logger }) {
    logger.debug('Hello', event)
  }
}

describe('Apapter', () => {
  it('Must throw an exception when target is not a class', () => {
    try {
      // Act
      Adapter({})(Application.prototype)
    } catch (error) {
      // Assert
      expect(error.message).toBe('This decorator can only be applied at class level.')
    }
  })

  it('Must return a class with `$$metadata$$` as static property and current value as `undefined`', () => {
    // Arrange
    const options = { handler: 'handle' }

    // Act
    const result = Adapter(options)(Application)

    // Assert
    expect(result.$$metadata$$).toBeTruthy()
    expect(result.$$metadata$$.adapter.handler).toBe('handle')
    expect(result.$$metadata$$.adapter.current).toBeUndefined()
  })
})

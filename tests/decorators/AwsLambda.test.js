import { AwsLambda } from '../../src/decorators/AwsLambda.mjs'
import { AWSLambdaAdapter } from '../../src/adapters/AWSLambdaAdapter.mjs'

const Application = class {
  handle (event, { logger }) {
    logger.debug('Hello', event)
  }
}

describe('AwsLambda', () => {
  it('Must return a class with `$$metadata$$` as static property and current value as `AWSLambdaAdapter`', () => {
    // Arrange
    const options = { handler: 'handle' }

    // Act
    const result = AwsLambda(options)(Application)

    // Assert
    expect(result.$$metadata$$).toBeTruthy()
    expect(result.$$metadata$$.adapter.options.handler).toBe('handle')
    expect(result.$$metadata$$.adapter.current).toEqual(AWSLambdaAdapter)
  })
})

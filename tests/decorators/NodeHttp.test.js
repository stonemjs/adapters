import { NodeHttp } from '../../src/decorators/NodeHttp.mjs'
import { NodeHTTPAdapter } from '../../src/adapters/NodeHttpAdapter.mjs'

const Application = class {
  handle (event, { logger }) {
    logger.debug('Hello', event)
  }
}

describe('NodeHttp', () => {
  it('Must return a class with `$$metadata$$` as static property and current value as `NodeHTTPAdapter`', () => {
    // Arrange
    const options = { handler: 'handle' }

    // Act
    const result = NodeHttp(options)(Application)

    // Assert
    expect(result.$$metadata$$).toBeTruthy()
    expect(result.$$metadata$$.adapter.options.handler).toBe('handle')
    expect(result.$$metadata$$.adapter.current).toEqual(NodeHTTPAdapter)
  })
})

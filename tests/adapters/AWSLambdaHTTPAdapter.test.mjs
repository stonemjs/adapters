import statuses from 'statuses'
import { HttpError } from '@stone-js/common'
import { AWSLambdaHTTPAdapter } from '../../../src/adapters/aws/AWSLambdaHTTPAdapter.mjs'

jest.mock('statuses', () => ({ message: {} }))
jest.mock('mime', () => ({ getType: jest.fn() }))
jest.mock('accepts', () => () => ({ type: jest.fn() }))
const adapterOptions = {}
const methodMiddleware = (passable, next) => {
  passable.event.method = passable.message.method
  return next(passable)
}

const SendMiddleware = class {
  constructor ({ config }) {
    this.type = config.get('body.defaultType', 'application/json')
  }

  handle (passable, next) {
    passable.result.type = this.type
    passable.response.send = () => ({
      statusCode: 200,
      body: passable.result
    })
    return next(passable)
  }
}

jest.mock('../../../src/middleware/aws/http/index.mjs', () => ({
  inputMiddleware: [methodMiddleware],
  outputMiddleware: [SendMiddleware]
}))

describe('AWSLambdaHTTPAdapter', () => {
  describe('#createAndRun', () => {
    beforeEach(() => {
      console.error = jest.fn()
      globalThis.window = undefined
    })

    afterEach(() => {
      console.error.mockRestore()
    })

    it('Must throw an error when adapter is running in a browser', async () => {
      try {
        // Act
        globalThis.window = {}
        expect(await new AWSLambdaHTTPAdapter().run(() => {})).toBeTruthy()
      } catch (error) {
        // Assert
        expect(error.message).toBe('This `AWSLambdaHTTPAdapter` must be used only in node.js context.')
      }
    })

    it('Must intercept error when app throw an error', async () => {
      // Arrange
      const app = (_request) => {
        throw new HttpError(null, 'Bad request', 'Invalid name', { headers: new Headers({ 'content-type': 'application/json' }) })
      }
      const body = { status: 500, message: 'An unexpected error has occurred.' }
      const adapter = new AWSLambdaHTTPAdapter({ baseUrl: 'https://localhost:9090', debug: true })
      const message = { method: 'GET' }
      adapter.setErrorHandler({ report: jest.fn(), render: jest.fn(() => body) })

      // Act
      const handler = await adapter.run(app)
      const response = await handler(message, {})

      // Assert
      expect(adapter.errorHandler.report).toHaveBeenCalled()
      expect(adapter.errorHandler.render).toHaveBeenCalled()
      expect(response).toEqual({
        statusCode: 500,
        body: JSON.stringify(body),
        statusMessage: statuses.message[500],
        headers: { 'content-type': 'application/json' }
      })
    })

    it('Must run function defined app with the node http adapter', async () => {
      // Arrange
      const app = (event, { platform }) => {
        return { method: event.method, platform }
      }
      const adapter = new AWSLambdaHTTPAdapter(adapterOptions)
      const message = { method: 'GET' }

      // Act
      const handler = await adapter.run(app)
      const response = await handler(message, {})

      // Assert
      expect(response).toEqual({ statusCode: 200, body: { method: 'GET', platform: 'aws_lambda_http', type: 'text/plain' } })
    })

    it('Must run class defined app with the node http adapter', async () => {
      // Arrange
      class App {
        handle (event, { platform }) {
          return { method: event.method, platform }
        }
      }
      const adapter = new AWSLambdaHTTPAdapter({ baseUrl: 'https://localhost:9090', debug: true })
      const message = { method: 'GET' }

      // Act
      const handler = await adapter.run(new App())
      const response = await handler(message, {})

      // Assert
      expect(response).toEqual({ statusCode: 200, body: { method: 'GET', platform: 'aws_lambda_http', type: 'application/json' } })
    })
  })
})

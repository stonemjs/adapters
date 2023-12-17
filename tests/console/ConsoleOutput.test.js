import { ConsoleOutput } from '../../src/console/ConsoleOutput.mjs'

jest.mock('progress', () => jest.fn())

describe('ConsoleOutput', () => {
  it('Facade methods must return correct values', async () => {
    // Arrange
    const stdConsole = {
      log: jest.fn(),
      table: jest.fn()
    }
    const smartConsole = {
      info: jest.fn(),
      fail: jest.fn(),
      start: jest.fn(),
      warn: jest.fn(),
      succeed: jest.fn()
    }
    const format = {
      redBright: jest.fn(),
      blueBright: jest.fn(),
      greenBright: jest.fn(),
      yellowBright: jest.fn()
    }
    const output = new ConsoleOutput(stdConsole, () => smartConsole, format)

    // Act
    output.spin()
    output.spinner()
    output.progresBar()
    output
      .show('hello')
      .table('hello table')
      .breakLine()
      .info('Hello')
      .info('Hello', false)
      .error('Hello')
      .error('Hello', false)
      .warn('Hello')
      .warn('Hello', false)
      .succeed('Hello')
      .succeed('Hello', false)

    // Assert
    expect(stdConsole.log).toHaveBeenCalled()
    expect(stdConsole.table).toHaveBeenCalled()

    expect(smartConsole.info).toHaveBeenCalled()
    expect(smartConsole.fail).toHaveBeenCalled()
    expect(smartConsole.start).toHaveBeenCalled()
    expect(smartConsole.warn).toHaveBeenCalled()
    expect(smartConsole.succeed).toHaveBeenCalled()

    expect(format.redBright).toHaveBeenCalled()
    expect(format.blueBright).toHaveBeenCalled()
    expect(format.greenBright).toHaveBeenCalled()
    expect(format.yellowBright).toHaveBeenCalled()
  })
})

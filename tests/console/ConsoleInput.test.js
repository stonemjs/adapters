import { ConsoleInput } from '../../src/console/ConsoleInput.mjs'

describe('ConsoleInput', () => {
  it('Facade methods must return correct values', async () => {
    // Arrange
    const prompt = jest.fn(() => ({ value: 'value' }))
    const input = new ConsoleInput(prompt)

    // Assert
    expect(await input.ask('Your name')).toBe('value')
    expect(await input.askNumber('Your name')).toBe('value')
    expect(await input.secret('Your name')).toBe('value')
    expect(await input.confirm('Your name')).toBe('value')
    expect(await input.choice('Your name', [])).toBe('value')
    expect(await input.choice('Your name', [], 0, true)).toBe('value')
    expect(await input.editor('Your name')).toBe('value')
    expect(prompt).toHaveBeenCalledTimes(7)
  })
})

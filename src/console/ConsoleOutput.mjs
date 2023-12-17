import ProgressBar from 'progress'

/**
 * Class representing a ConsoleOutput Facade.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class ConsoleOutput {
  #format
  #stdConsole
  #smartConsole

  /**
   * Create a ConsoleOutput.
   *
   * @param {Object} stdConsole - console object.
   * @param {Object} smartConsole - smart console utils, like `ora`.
   * @param {Object} format - format util lib, like `chalk`.
   */
  constructor (stdConsole, smartConsole, format) {
    this.#format = format
    this.#stdConsole = stdConsole
    this.#smartConsole = smartConsole
  }

  /**
   * Output uncolored text.
   *
   * @param   {string} value
   * @returns {this} `this` for chaining.
   */
  show (value) {
    this.#stdConsole.log(value)
    return this
  }

  /**
   * Output value in table.
   *
   * @param   {string} value
   * @returns {this} `this` for chaining.
   */
  table (value) {
    this.#stdConsole.table(value)
    return this
  }

  /**
   * Output break line.
   *
   * @param   {number} value
   * @returns {this} `this` for chaining.
   */
  breakLine (value) {
    this.#stdConsole.log(Array(value).join('\n'))
    return this
  }

  /**
   * Output info colored text.
   *
   * @param   {string} value
   * @param   {boolean} [color=true]
   * @returns {this} `this` for chaining.
   */
  info (value, color = true) {
    this.#smartConsole(color ? this.#format.blueBright(value) : value).info()
    return this
  }

  /**
   * Output error colored text.
   *
   * @param   {string} value
   * @param   {boolean} [color=true]
   * @returns {this} `this` for chaining.
   */
  error (value, color = true) {
    this.#smartConsole(color ? this.#format.redBright(value) : value).fail()
    return this
  }

  /**
   * Output warn colored text.
   *
   * @param   {string} value
   * @param   {boolean} [color=true]
   * @returns {this} `this` for chaining.
   */
  warn (value, color = true) {
    this.#smartConsole(color ? this.#format.yellowBright(value) : value).warn()
    return this
  }

  /**
   * Output succeed colored text.
   *
   * @param   {string} value
   * @param   {boolean} [color=true]
   * @returns {this} `this` for chaining.
   */
  succeed (value, color = true) {
    this.#smartConsole(color ? this.#format.greenBright(value) : value).succeed()
    return this
  }

  /**
   * Output spinner.
   *
   * @param   {string} [value=null]
   * @returns {this} `this` for chaining.
   */
  spin (value = null) {
    return this.spinner(value).start()
  }

  /**
   * Output spinner.
   *
   * @param   {string} [value=null]
   * @returns {this} `this` for chaining.
   */
  spinner (value = null) {
    return this.#smartConsole(value)
  }

  /**
   * Output progress bar.
   *
   * @param   {string} tokens
   * @param   {Object} options
   * @returns {ProgressBar}
   */
  progresBar (tokens, options) {
    return new ProgressBar(tokens, options)
  }
}

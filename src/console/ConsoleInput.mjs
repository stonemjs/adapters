/**
 * Class representing a ConsoleInput Facade.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class ConsoleInput {
  #prompt

  /**
   * Create a ConsoleInput.
   *
   * @param {Object} prompt - prompt module, like `inquirer`.
   */
  constructor (prompt) {
    this.#prompt = prompt
  }

  /**
   * Questionnaire.
   *
   * @param   {Object[]} questions
   * @returns {Object} return prompt.
   */
  questionnaire (questions) {
    return this.#prompt(questions)
  }

  /**
   * Prompt.
   *
   * @param   {Object} question
   * @returns {*}
   */
  async prompt (question) {
    question.name = 'value'
    const answer = await this.questionnaire([question])
    return answer.value
  }

  /**
   * Ask.
   *
   * @param   {string} message
   * @param   {string} [fallback=null]
   * @returns {string}
   */
  ask (message, fallback = null) {
    return this.prompt({ message, default: fallback })
  }

  /**
   * AskNumber.
   *
   * @param   {string} message
   * @param   {number} [fallback=null]
   * @returns {number}
   */
  askNumber (message, fallback = null) {
    return this.prompt({ type: 'number', message, default: fallback })
  }

  /**
   * Secret.
   *
   * @param   {string} message
   * @returns {string}
   */
  secret (message) {
    return this.prompt({ type: 'password', message })
  }

  /**
   * Confirm.
   *
   * @param   {string} message
   * @param   {boolean} [fallback=false]
   * @returns {boolean}
   */
  confirm (message, fallback = false) {
    return this.prompt({ type: 'confirm', message, default: fallback })
  }

  /**
   * Choice.
   *
   * @param   {string} message
   * @param   {Array} choices
   * @param   {number} [fallbackIndex=0]
   * @param   {boolean} [multiple=false]
   * @returns {*}
   */
  choice (message, choices, fallbackIndex = 0, multiple = false) {
    return this.prompt({ type: multiple ? 'checkbox' : 'rawlist', choices, message, default: fallbackIndex })
  }

  /**
   * Editor.
   *
   * @param   {string} message
   * @param   {string} [fallback=null]
   * @returns {string}
   */
  editor (message, fallback = null) {
    return this.prompt({ type: 'editor', message, default: fallback })
  }
}

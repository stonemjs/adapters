import ora from 'ora'
import yargs from 'yargs'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { argv } from 'node:process'
import { hideBin } from 'yargs/helpers'
import { Adapter } from './Adapter.mjs'
import { NODE_CONSOLE_PLATFORM } from '../constants.mjs'
import { ConsoleInput } from '../console/ConsoleInput.mjs'
import { RuntimeError, isBrowser } from '@stone-js/common'
import { ConsoleOutput } from '../console/ConsoleOutput.mjs'

/**
 * Class representing a NodeConsoleAdapter.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @extends Adapter
 */
export class NodeConsoleAdapter extends Adapter {
  /**
   * Run handler.
   *
   * @returns {void}
   * @throws  {RuntimeError}
   */
  async run () {
    await this._onInit()

    const handler = this._handlerFactory()
    const container = handler.container
    const builder = yargs(hideBin(argv)).scriptName('stone')

    this._setPlatform(container, NODE_CONSOLE_PLATFORM)

    container
      .instanceIf('format', chalk)
      .instanceIf('builder', builder)
      .instanceIf('output', new ConsoleOutput(console, ora, chalk))
      .instanceIf('input', new ConsoleInput(inquirer.createPromptModule()))

    await this._beforeHandle(handler)
    await this._onMessageReceived(handler, { message: this.#getMessage(builder) })
  }

  /**
   * Hook that runs at each events and just before running the action handler.
   *
   * @throws {RuntimeError}
   */
  async _onInit () {
    if (isBrowser()) {
      throw new RuntimeError('This `NodeConsoleAdapter` must be used only in node.js context.')
    }

    await super._onInit()
  }

  /**
   * Create and return an Incoming message.
   *
   * @param   {Object} builder - Yargs builder.
   * @returns {Object}
   */
  #getMessage (builder) {
    const argv = builder.argv
    const args = Object.fromEntries(Object.entries(argv).filter(([key]) => !['_', '$0'].includes(key)))
    return {
      ...args,
      _extra: argv._,
      _script: argv.$0
    }
  }
}

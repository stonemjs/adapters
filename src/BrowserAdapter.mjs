import { Adapter } from './Adapter.mjs'
import { BROWSER_PLATFORM } from './constants.mjs'
import { RuntimeError, isBrowser } from '@stone-js/common'

/**
 * Class representing a BrowserAdapter.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @extends Adapter
 */
export class BrowserAdapter extends Adapter {
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

    this._setPlatform(container, BROWSER_PLATFORM)

    this
      .#getEvents(container)
      .forEach(({ name, options }) => {
        this.#getTarget(container).addEventListener(name, async (message) => await this.#eventListener(handler, message), options)
      })
  }

  /**
   * Hook that runs at each events and just before running the action handler.
   *
   * @throws {RuntimeError}
   */
  async _onInit () {
    if (!isBrowser()) {
      throw new RuntimeError('This `BrowserAdapter` must be used only in browser context.')
    }

    await super._onInit()
  }

  /**
   * Get target.
   *
   * @param   {Container} container - Service container.
   * @returns {EventTarget}
   */
  #getTarget (container) {
    const selector = this._getConfig(container)?.get('app.adapter.targetSelector')
    if (typeof selector === 'string') {
      return document.querySelector(selector)
    } else {
      return window
    }
  }

  /**
   * Get Events.
   *
   * @param   {Container} container - Service container.
   * @returns {Array}
   */
  #getEvents (container) {
    const fallback = [{ name: 'DOMContentLoaded', options: null }]

    return this
      ._getConfig(container)
      ?.get('app.adapter.events', fallback)
      ?.map(event => typeof event === 'string' ? ({ name: event, options: null }) : ({ options: null, ...event })) ??
      fallback
  }

  async #eventListener (handler, message) {
    await this._beforeHandle(handler)
    await this._onMessageReceived(handler, { message })
  }
}

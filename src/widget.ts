import _merge from 'lodash/merge'
import { EventEmitter } from 'events'

import { UI } from './ui'
import { type Position, type Style, TextAlign } from './types'
import { ANSI_RESTORE_CURSOR_POSITION, ANSI_SAVE_CURSOR_POSITION } from './ansi'

export interface WidgetArgs {
  ui: UI
  width?: number
  height?: number
  style?: Style
  position?: Position
}

const DEFAULT_WIDTH = 0
const DEFAULT_HEIGHT = 0
const DEFAULT_STYLE = {
  textAlign: TextAlign.Left,
}

const DEFAULT_POSITION = {
  x: 0,
  y: 0,
}

export abstract class Widget extends EventEmitter {
  protected ui: UI
  protected style: Style
  protected position: Position
  protected width: number
  protected height: number

  protected _isFocused: boolean = false

  constructor(args: WidgetArgs) {
    super()

    const { ui, width, height, style, position } = args

    this.width = width || DEFAULT_WIDTH
    this.height = height || DEFAULT_HEIGHT
    this.style = _merge({}, DEFAULT_STYLE, style)
    this.position = _merge({}, DEFAULT_POSITION, position)

    this.ui = ui
    this.ui.addWidget(this)
  }

  render(): void {
    const { x, y } = this.position

    this.ui.write(ANSI_SAVE_CURSOR_POSITION)

    this.lines.forEach((line: string, i: number): void => {
      this.ui.moveCursor({ x, y: y + i })
      this.ui.write(line)
    })

    this.ui.write(ANSI_RESTORE_CURSOR_POSITION)
  }

  focus(): void {
    if (!this._isFocused) {
      this._isFocused = true
      this.render()
      this.emit('focus')
    }
  }

  blur(): void {
    if (this._isFocused) {
      this._isFocused = false
      this.render()
      this.emit('blur')
    }
  }

  get isFocused(): boolean {
    return this._isFocused
  }

  contains(position: Position): boolean {
    return (
      position.x >= this.position.x
      && position.x < this.position.x + this.width
      && position.y >= this.position.y
      && position.y < this.position.y + this.height
    )
  }

  abstract get lines(): string[]
}

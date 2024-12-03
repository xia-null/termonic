import _merge from 'lodash/merge'
import { EventEmitter } from 'events'

import { UI } from './ui'
import { color } from './utils'
import { ANSI_RESTORE_CURSOR_POSITION, ANSI_SAVE_CURSOR_POSITION } from './ansi'
import {
  type Position,
  type Style,
  TerminalMouseEvent,
  TextAlign
} from './types'

export interface WidgetArgs {
  ui: UI
  width?: number
  height?: number
  style?: Style
  position?: Position
}

export const DEFAULT_WIDTH = 0
export const DEFAULT_HEIGHT = 0
export const DEFAULT_POSITION = {
  x: 0,
  y: 0
}

export const DEFAULT_COLOR = color(254, 254, 254)
export const DEFAULT_BORDER_COLOR = color(254, 254, 254)
export const DEFAULT_TEXT_ALIGN = TextAlign.Left
export const DEFAULT_BACKGROUND_COLOR = color(0, 0, 0)
export const DEFAULT_STYLE = {
  textAlign: DEFAULT_TEXT_ALIGN,
  color: DEFAULT_COLOR,
  borderColor: DEFAULT_BORDER_COLOR,
  backroundColor: DEFAULT_BACKGROUND_COLOR
}

export abstract class Widget extends EventEmitter {
  protected ui: UI
  protected _style: Style
  protected _width: number
  protected _height: number
  protected _position: Position
  protected _isFocused: boolean = false
  protected _isHovered: boolean = false
  protected _isClicked: boolean = false

  constructor(args: WidgetArgs) {
    super()

    const { ui, width, height, style, position } = args

    this._width = width || DEFAULT_WIDTH
    this._height = height || DEFAULT_HEIGHT
    this._style = _merge({}, DEFAULT_STYLE, style)
    this._position = _merge({}, DEFAULT_POSITION, position)

    this.ui = ui
    this.ui.addWidget(this)
  }

  render(): void {
    this.ui.write(ANSI_SAVE_CURSOR_POSITION)

    const lines = this.renderableContent

    this.ui.moveCursor(this._position)

    lines.forEach((line: string, i: number): void => {
      line.split('').forEach((char: string, j: number): void => {
        if (char === ' ') {
          this.ui.color = this.backgroundColor
        } else if (this.isBorder(j, i)) {
          this.ui.color = this.borderColor
        } else {
          this.ui.color = this.color
        }

        this.ui.write(char)
      })

      this.ui.moveCursor({
        x: this._position.x,
        y: this._position.y + i + 1
      })
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
      position.x >= this._position.x &&
      position.x < this._position.x + this.width &&
      position.y >= this._position.y &&
      position.y < this._position.y + this.height
    )
  }

  onHoverEnd(data: TerminalMouseEvent): void {
    this._isHovered = false
    this.emit('hover:end', data)
  }

  onHoverStart(data: TerminalMouseEvent): void {
    this._isHovered = true
    this.emit('hover', data)
  }

  onClickEnd(data: TerminalMouseEvent): void {
    this._isClicked = false
    this.emit('click:end', data)
  }

  onClickStart(data: TerminalMouseEvent): void {
    this._isClicked = true
    this.focus()
    this.emit('click', data)
  }

  get borderColor(): string {
    return this._style.borderColor ?? DEFAULT_BORDER_COLOR
  }

  get backgroundColor(): string {
    return this._style.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
  }

  get color(): string {
    return this._style.color ?? DEFAULT_COLOR
  }

  get width(): number {
    return this._width
  }

  get height(): number {
    return this._height
  }

  get isHovered(): boolean {
    return this._isHovered
  }

  get isClicked(): boolean {
    return this._isClicked
  }

  set position(position: Position) {
    this._position = { ...this._position, ...position }
  }

  get position(): Position {
    return this._position
  }

  abstract get renderableContent(): string[]
  abstract isBorder(x: number, y: number): boolean
}

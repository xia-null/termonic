import _merge from 'lodash/merge'
import { EventEmitter } from 'events'

import { UI } from './ui'
import { color } from './utils'
import {
  type Style,
  type Position,
  type TerminalMouseEvent,
  TerminalKeyEvent,
} from './types'

export interface WidgetArgs {
  ui: UI
  width?: number
  height?: number
  position?: Position
  style?: Style
}

export const DEFAULT_WIDGET_WIDTH = 0
export const DEFAULT_WIDGET_HEIGHT = 0
export const DEFAULT_WIDGET_POSITION = {
  x: 0,
  y: 0
}

export const DEFAULT_WIDGET_COLOR = color(254, 254, 254)
export const DEFAULT_WIDGET_BACKGROUND_COLOR = color(0, 0, 0)
export const DEFAULT_WIDGET_STYLE = {
  color: DEFAULT_WIDGET_COLOR,
  backroundColor: DEFAULT_WIDGET_BACKGROUND_COLOR
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

    this._width = width || DEFAULT_WIDGET_WIDTH
    this._height = height || DEFAULT_WIDGET_HEIGHT
    this._style = _merge({}, DEFAULT_WIDGET_STYLE, style)
    this._position = _merge({}, DEFAULT_WIDGET_POSITION, position)

    this.ui = ui
    this.ui.addWidget(this)
  }

  render(): void {
    this.ui.saveCursorPosition()
    this.ui.moveCursor(this._position)

    this.getRendered().forEach((line: string, i: number): void => {
      line.split('').forEach((char: string, j: number): void => {
        this.ui.write(char, this.getCharColor(char, j, i))
      })

      this.ui.moveCursor({
        x: this._position.x,
        y: this._position.y + i + 1
      })
    })

    this.ui.restoreCursorPosition()
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
    const { x, y } = position

    return (
      x >= this._position.x &&
      x <= this._position.x + this.width &&
      y >= this._position.y &&
      y <= this._position.y + this.height
    )
  }

  onHover(data: TerminalMouseEvent): void {
    this.emit('hover', data)
  }

  onHoverEnd(data: TerminalMouseEvent): void {
    this._isHovered = false
    this.emit('hover:end', data)
  }

  onHoverStart(data: TerminalMouseEvent): void {
    this._isHovered = true
    this.emit('hover:start', data)
  }

  onClickEnd(data: TerminalMouseEvent): void {
    this._isClicked = false
    this.emit('click:end', data)
  }

  onClick(data: TerminalMouseEvent): void {
    this._isClicked = true
    this.emit('click', data)
  }

  onKey(name: string, matches: string[], data: TerminalKeyEvent): void {
    this.emit('key', name, matches, data)
  }

  onMouseWheelUp(data: TerminalMouseEvent): void {
    this.emit('mouse:wheel:up', data)
  }

  onMouseWheelDown(data: TerminalMouseEvent): void {
    this.emit('mouse:wheel:down', data)
  }

  get backgroundColor(): string {
    return this._style.backgroundColor ?? DEFAULT_WIDGET_BACKGROUND_COLOR
  }

  get color(): string {
    return this._style.color ?? DEFAULT_WIDGET_COLOR
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

  abstract getRendered(): string[]

  // @ts-expect-error arguments are unused but documentation
  getCharColor(char: string, x: number, y: number): string {
    return char === ' '
      ? this.backgroundColor
      : this.color
  }
}

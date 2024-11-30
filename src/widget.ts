import _merge from 'lodash/merge'
import { EventEmitter } from 'events'

import { UI } from './ui'
import { type Position, type Style, TerminalMouseEvent, TextAlign } from './types'
import { ANSI_BLACK, ANSI_RESTORE_CURSOR_POSITION, ANSI_SAVE_CURSOR_POSITION, ANSI_WHITE } from './ansi'

export type WidgetRenderableContentColor = string | (string | [number, string])[]

export interface WidgetRenderableContent {
  lines: string[]
  colors: WidgetRenderableContentColor[]
}

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
  y: 0,
}

export const DEFAULT_COLOR = ANSI_WHITE
export const DEFAULT_BORDER_COLOR = ANSI_WHITE
export const DEFAULT_TEXT_ALIGN = TextAlign.Left
export const DEFAULT_BACKGROUND_COLOR = ANSI_BLACK
export const DEFAULT_STYLE = {
  textAlign: DEFAULT_TEXT_ALIGN,
  color: DEFAULT_COLOR,
  borderColor: DEFAULT_BORDER_COLOR,
  backroundColor: DEFAULT_BACKGROUND_COLOR,
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

    const { lines, colors } = this.renderableContent

    if (lines.length !== colors.length) {
      throw new Error('lines and colors must have the same length')
    }

    lines.forEach((line: string, i: number): void => {
      const color = colors[i]

      if (typeof color === 'string') {
        this.ui.color = color
        this.ui.moveCursor({ x, y: y + i })
        this.ui.write(line)
      } else if (Array.isArray(color)) {
        const charsToRender = line.split('')
        let colorsToRender = [...color]

        let currentColorStartIndex = -1

        charsToRender.forEach((c: string, j: number): void => {
          let currentColor = colorsToRender[0]

          if (Array.isArray(currentColor)) {
            const [colorLength, colorStr] = currentColor

            if (currentColorStartIndex === -1) {
              currentColorStartIndex = j
              this.ui.color = colorStr

              this.ui.moveCursor({ x: x + j, y: y + i })
              this.ui.write(c)

              return
            } else if (j > currentColorStartIndex + colorLength) {
              colorsToRender = colorsToRender.slice(1)
              currentColorStartIndex = -1
              currentColor = colorsToRender[0]
            } else {
              this.ui.moveCursor({ x: x + j, y: y + i })
              this.ui.write(c)

              return
            }
         }

         const colorStr = `${currentColor}`[0] === '!'
            ? currentColor.slice(1)
            : currentColor

         if (!Array.isArray(currentColor)) {
            colorsToRender = colorsToRender.slice(1)
            currentColorStartIndex = -1
         }

         if (colorStr === this.ui.color || (`${currentColor}`[0] === '!' && i !== charsToRender.length - 1)) {
            this.ui.moveCursor({ x: x + j, y: y + i })
            this.ui.write(c)
         } else if (colorStr !== this.ui.color) {
            this.ui.color = `${colorStr}`
            this.ui.moveCursor({ x: x + j, y: y + i })
            this.ui.write(c)

            colorsToRender = colorsToRender.slice(1)
          }
        })
      }
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

  onHover(_: TerminalMouseEvent): void {}
  onHoverEnd(_: TerminalMouseEvent): void {}
  onHoverStart(_: TerminalMouseEvent): void {}

  get borderColor(): string {
    return this.style.borderColor ?? DEFAULT_BORDER_COLOR
  }

  get backgroundColor(): string {
    return this.style.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
  }

  get color(): string {
    return this.style.color ?? DEFAULT_COLOR
  }

  abstract get renderableContent(): WidgetRenderableContent
}

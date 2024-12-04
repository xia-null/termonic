import os from 'os'
import { EventEmitter } from 'events'
import { terminal } from 'terminal-kit'

import { color } from './utils'
import { Widget } from './widget'
import {
  ANSI_CURSOR_UP,
  ANSI_SHOW_CURSOR,
  ANSI_HIDE_CURSOR,
  ANSI_CURSOR_LEFT,
  ANSI_CURSOR_DOWN,
  ANSI_CLEAR_SCREEN,
  ANSI_CURSOR_RIGHT,
  ANSI_CURSOR_POSITION,
  ANSI_SAVE_CURSOR_POSITION,
  ANSI_RESTORE_CURSOR_POSITION,
} from './ansi'

import {
  type Position,
  type TerminalKeyEvent,
  TerminalMouseEventName,
  type TerminalMouseEvent,
} from './types'

export const DEFAULT_UI_COLORED = true

const { EOL } = os

export class UI extends EventEmitter {
  protected _color: string = color(254, 254, 254)

  protected widgets: Widget[] = []

  constructor(protected stream: NodeJS.WriteStream, public colored: boolean = DEFAULT_UI_COLORED) {
    super()

    // Initialize this._color to match active terminal color
    if (this.colored) {
      this.write(this._color)
    }

    terminal.grabInput({ mouse: 'motion' })
    terminal.on(
      'key',
      (name: string, matches: string[], data: TerminalKeyEvent): void => {
        if (name === 'CTRL_C') {
          this.write(ANSI_CLEAR_SCREEN)
          this.moveCursor()

          process.exit(0)
        }

        const focusedWidget = this.widgets.find((widget: Widget): boolean => (
          widget.isFocused
        ))

        if (typeof focusedWidget !== 'undefined') {
          focusedWidget.onKey(name, matches, data)
        }

        this.emit('key', name, matches, data)
      }
    )

    terminal.on(
      'mouse',
      (name: TerminalMouseEventName, data: TerminalMouseEvent): void => {
        const { x, y } = data

        if (name === TerminalMouseEventName.MouseLeftButtonPressed) {
          let widgetToClick: Widget | null = null

          for (const widget of this.widgets) {
            if (widget.contains({ x, y }) && widgetToClick === null) {
              widgetToClick = widget
            } else if (widget.isFocused) {
              widget.blur()
            }
          }

          // TODO: Consider moving the focus call elsewhere
          if (widgetToClick !== null) {
            widgetToClick.onClick(data)
            widgetToClick.focus()
          }
        } else if (name === TerminalMouseEventName.MouseLeftButtonReleased) {
          for (const widget of this.widgets) {
            if (widget.isClicked) {
              widget.onClickEnd(data)
            }
          }
        } else if (name === TerminalMouseEventName.MouseMotion) {
          for (const widget of this.widgets) {
            const widgetIsTarget = widget.contains({ x, y })

            if (widgetIsTarget) {
              if (widget.isHovered) {
                widget.onHover(data)
              } else {
                widget.onHoverStart(data)
              }
            } else if (widget.isHovered) {
              widget.onHoverEnd(data)
            }
          }
        } else if (name === TerminalMouseEventName.MouseWheelUp) {
          for (const widget of this.widgets) {
            if (widget.contains({ x, y })) {
              widget.onMouseWheelUp(data)
            }
          }
        } else if (name === TerminalMouseEventName.MouseWheelDown) {
          for (const widget of this.widgets) {
            if (widget.contains({ x, y })) {
              widget.onMouseWheelDown(data)
            }
          }
        }

        this.emit('mouse', name, data)
      }
    )
  }

  write(content: string, color?: string): void {
    if (typeof color !== 'undefined') {
      this.color = color
    }

    this.stream.write(content)
  }

  writeLine(content: string): void {
    this.write(`${content}${EOL}`)
  }

  clear(): void {
    this.write(ANSI_CLEAR_SCREEN)
  }

  render(clear?: boolean): void {
    if (clear) {
      this.clear()
    }

    this.widgets.forEach((widget: Widget): void => {
      widget.render()
    })
  }

  moveCursor(position?: Position) {
    const { x = 0, y = 0 } = position ?? {}

    this.write(ANSI_CURSOR_POSITION(x, y))
  }

  moveCursorLeft(cols: number = 1): void {
    this.write(ANSI_CURSOR_LEFT(cols))
  }

  moveCursorRight(cols: number = 1): void {
    this.write(ANSI_CURSOR_RIGHT(cols))
  }

  moveCursorUp(rows: number = 1): void {
    this.write(ANSI_CURSOR_UP(rows))
  }

  moveCursorDown(rows: number = 1): void {
    this.write(ANSI_CURSOR_DOWN(rows))
  }

  addWidget(widget: Widget): void {
    this.widgets.push(widget)
  }

  removeWidget(widget: Widget): void {
    if (widget.isFocused) {
      widget.blur()
    }

    this.widgets = this.widgets.filter((w: Widget): boolean => w !== widget)
  }

  set color(color: string) {
    this._color = color

    if (this.colored) {
      this.write(color)
    }
  }

  get color(): string | null {
    return this._color
  }

  removeAllWidgets(): void {
    this.widgets.forEach((widget: Widget): void => {
      this.removeWidget(widget)
    })
  }

  showCursor(): void {
    this.write(ANSI_SHOW_CURSOR)
  }

  hideCursor(): void {
    this.write(ANSI_HIDE_CURSOR)
  }

  saveCursorPosition(): void {
    this.write(ANSI_SAVE_CURSOR_POSITION)
  }

  restoreCursorPosition(): void {
    this.write(ANSI_RESTORE_CURSOR_POSITION)
  }
}

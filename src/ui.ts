import os from 'os'
import { EventEmitter } from 'events'
import { terminal } from 'terminal-kit'

import { Widget } from './widget'
import { ANSI_CLEAR_SCREEN, ANSI_CURSOR_POSITION, ANSI_HIDE_CURSOR, ANSI_SHOW_CURSOR, ANSI_WHITE } from './ansi'
import { type TerminalMouseEvent, type TerminalKeyEvent, TerminalMouseEventName, type Position } from './types'

const { EOL } = os

export class UI extends EventEmitter {
  protected widgets: Widget[] = []
  protected hoveredWidgets: Widget[] = []

  protected currentColor: string

  constructor(protected stream: NodeJS.WriteStream) {
    super()

    this.currentColor = ANSI_WHITE
    this.write(this.currentColor)

    terminal.grabInput({ mouse: 'motion' })
    terminal.on('key', (name: string, matches: string[], data: TerminalKeyEvent): void => {
      if (name === 'CTRL_C') {
        this.write(ANSI_CLEAR_SCREEN)
        this.moveCursor()

        process.exit(0)
      }

      this.emit('key', name, matches, data)
    })

    terminal.on('mouse', (name: TerminalMouseEventName, data: TerminalMouseEvent): void => {
      const { x, y } = data

      if (name === TerminalMouseEventName.MouseLeftButtonPressed) {
        let widgetToFocus: Widget | null = null
        const widgetsToBlur: Widget[] = []

        for (const widget of this.widgets) {
          if (widget.contains({ x, y })) {
            widgetToFocus = widget
          } else if (widget.isFocused) {
            widgetsToBlur.push(widget)
          }
        }

        for (const widget of widgetsToBlur) {
          widget.blur()
        }

        if (widgetToFocus !== null) {
          this.write(ANSI_SHOW_CURSOR)
          widgetToFocus.focus()
        } else {
          this.write(ANSI_HIDE_CURSOR)
        }
      } else if (name === TerminalMouseEventName.MouseMotion) {
        for (const widget of this.widgets) {
          if (widget.contains({ x, y })) {
            widget.onHover(data)

            if (!this.hoveredWidgets.includes(widget)) {
              this.hoveredWidgets.push(widget)
              widget.onHoverStart(data)
            }
          } else if (this.hoveredWidgets.includes(widget)) {
            this.hoveredWidgets = this.hoveredWidgets.filter((w: Widget): boolean => w !== widget)
            widget.onHoverEnd(data)
          }
        }
      }

      this.emit('mouse', name, data)
    })
  }

  write(content: string): void {
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

  addWidget(widget: Widget): void {
    this.widgets.push(widget)

    widget.on('focus', this.onWidgetFocus.bind(this))
    widget.on('blur', this.onWidgetBlur.bind(this))
  }

  removeWidget(widget: Widget): void {
    this.widgets = this.widgets.filter((w: Widget): boolean => w !== widget)
  }

  onWidgetFocus(): void {
    this.write(ANSI_SHOW_CURSOR)
  }

  onWidgetBlur(): void {
    const focusedWidget = this.widgets.find((widget: Widget): boolean => widget.isFocused)

    if (typeof focusedWidget === 'undefined') {
      this.write(ANSI_HIDE_CURSOR)
    }
  }

  set color(currentColor: string) {
    if (this.currentColor === currentColor) {
      return
    }

    this.currentColor = currentColor
    this.write(currentColor)
  }

  get color(): string {
    return this.currentColor
  }
}


import os from 'os'
import { EventEmitter } from 'events'
import { terminal } from 'terminal-kit'

import { Box } from './widgets'
import { Widget } from './widget'
import { ANSI_CLEAR_SCREEN, ANSI_CURSOR_POSITION, ANSI_HIDE_CURSOR, ANSI_SHOW_CURSOR } from './ansi'
import { type TerminalMouseEvent, type TerminalKeyEvent, TerminalMouseEventName, type Position } from './types'

const { EOL } = os

export class UI extends EventEmitter {
  protected currentColor: string | null = null

  protected widgets: Widget[] = []
  protected hoveredWidgets: Widget[] = []
  protected clickedWidgets: Widget[] = []

  public logBox: Box | null = null

  constructor(protected stream: NodeJS.WriteStream) {
    super()

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
        const widgetsToClick: Widget[] = []

        for (const widget of this.widgets) {
          if (widget.contains({ x, y })) {
            widgetToFocus = widget

            if (!widgetsToClick.includes(widget) && !this.clickedWidgets.includes(widget)) {
              widgetsToClick.push(widget)
            }
          } else if (widget.isFocused) {
            widgetsToBlur.push(widget)
          }
        }

        for (const widget of widgetsToClick) {
          widget.onClickStart(data)

          this.clickedWidgets.push(widget)
        }

        if (!this.clickedWidgets.includes(widgetToFocus as Widget)) {
          if (widgetToFocus !== null) {
            this.write(ANSI_SHOW_CURSOR)
            widgetToFocus.focus()
          } else {
            this.write(ANSI_HIDE_CURSOR)
          }
        }
      } else if (name === TerminalMouseEventName.MouseLeftButtonReleased) {
        for (const widget of this.clickedWidgets) {
          widget.onClickEnd(data)
        }

        this.clickedWidgets = []
      } else if (name === TerminalMouseEventName.MouseMotion) {
        for (const widget of this.widgets) {
          const widgetIsTarget = widget.contains({ x, y })

          if (widgetIsTarget && !widget.isHovered) {
            widget.onHoverStart(data)
          } else if (!widgetIsTarget && widget.isHovered && !this.clickedWidgets.includes(widget)) {
            widget.onHoverEnd(data)
          }
        }
      }

      this.emit('mouse', name, data)
    })

    const logBoxWidth = process.stdout.columns - 2
    const logBoxHeight = Math.min(15, process.stdout.rows)

    this.logBox = new Box({
      ui: this,
      position: { x: 1, y: process.stdout.rows - logBoxHeight - 2 },
      width: logBoxWidth,
      height: logBoxHeight,
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

  log(message: string): void {
    if (this.logBox !== null) {
      this.logBox.content = `${this.logBox.content}${message}${EOL}`
      this.logBox.render()
    }
  }

  set color(currentColor: string) {
    // TODO: Get rid of currentColor
    this.currentColor = currentColor
    this.write(currentColor)
  }

  get color(): string | null {
    return this.currentColor
  }
}


import { EOL } from 'os'

import { color } from '../utils'
import { TerminalMouseEvent, TextAlign, VerticalAlign } from '../types'
import { DEFAULT_BOX_CONTENT, Box, type BoxStyle, type BoxArgs } from './box'

export enum ButtonType {
  Solid = 'SOLID',
  Outline = 'OUTLINE'
}

export interface ButtonArgs extends BoxArgs {
  disabled?: boolean
  type?: ButtonType
}

const PADDING_X = 3
const PADDING_Y = 2

export const DEFAULT_BUTTON_DISABLED = false
export const DEFAULT_BUTTON_TYPE = ButtonType.Solid
export const DEFAULT_BUTTON_TEXT_ALIGN = TextAlign.Center
export const DEFAULT_BUTTON_VERTICAL_ALIGN = VerticalAlign.Center

export const DEFAULT_BUTTON_COLOR = color(220, 220, 220)
export const DEFAULT_BUTTON_BORDER_COLOR = color(100, 100, 254)
export const DEFAULT_BUTTON_BACKGROUND_COLOR = color(50, 50, 50)
export const DEFAULT_BUTTON_STYLE = {
  color: DEFAULT_BUTTON_COLOR,
  textAlign: DEFAULT_BUTTON_TEXT_ALIGN,
  verticalAlign: DEFAULT_BUTTON_VERTICAL_ALIGN,
  borderColor: DEFAULT_BUTTON_BORDER_COLOR,
  backgroundColor: DEFAULT_BUTTON_BACKGROUND_COLOR,
}

export class Button extends Box {
  protected disabled: boolean
  protected type: ButtonType

  protected _initialStyle: BoxStyle

  constructor(args: ButtonArgs) {
    const { content = DEFAULT_BOX_CONTENT, width, height, ...otherArgs } = args
    const contentWidth = content.length + PADDING_X * 2
    const contentHeight = content.split(EOL).length + PADDING_Y * 2
    const style = {
      ...DEFAULT_BUTTON_STYLE,
      ...(otherArgs.style ?? {}),
    }

    super({
      content,
      width:
        typeof width === 'undefined'
          ? contentWidth
          : Math.max(width, contentWidth),

      height:
        typeof height === 'undefined'
          ? contentHeight
          : Math.max(height, contentHeight),

      style,

      ...otherArgs
    })

    const { disabled, type } = args

    this.type = type ?? DEFAULT_BUTTON_TYPE
    this.disabled = disabled ?? DEFAULT_BUTTON_DISABLED
    this._initialStyle = style
  }

  setStyleHovered(): void {
    this._style.backgroundColor = this.disabled
      ? color(10, 10, 10)
      : color(100, 100, 100)

    this._style.borderColor = color(200, 200, 254)
    this._style.color = color(254, 254, 254)
  }

  setStyleClicked(): void {
    this._style.color = color(254, 254, 254)
    this._style.borderColor = color(0, 200, 254)
    this._style.backgroundColor = color(50, 50, 50)
  }

  resetStyle(): void {
    this._style.backgroundColor = this._initialStyle.backgroundColor ?? DEFAULT_BUTTON_BACKGROUND_COLOR
    this._style.borderColor = this._initialStyle.borderColor ?? DEFAULT_BUTTON_BORDER_COLOR
    this._style.color = this._initialStyle.color ?? DEFAULT_BUTTON_COLOR
  }

  onHoverStart(data: TerminalMouseEvent): void {
    if (!this.isHovered) {
      super.onHover(data)

      if (!this.isClicked) {
        this.setStyleHovered()
        this.render()
      }
    }
  }

  onHoverEnd(data: TerminalMouseEvent): void {
    if (this.isHovered) {
      super.onHoverEnd(data)

      if (!this.isClicked) {
        this.resetStyle()
        this.render()
      }
    }
  }

  onClick(data: TerminalMouseEvent): void {
    if (!this.isClicked) {
      super.onClick(data)

      this.setStyleClicked()
      this.render()
    }
  }

  onClickEnd(data: TerminalMouseEvent): void {
    if (this.isClicked) {
      super.onClickEnd(data)

      if (this.isHovered) {
        this.setStyleHovered()
      } else {
        this.resetStyle()
      }

      this.render()
    }
  }
}

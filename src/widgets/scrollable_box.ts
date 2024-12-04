import { color } from '../utils'
import { Box, type BoxStyle, type BoxArgs } from './box'
import { Direction, Location, type TerminalMouseEvent } from '../types'

export interface ScrollableBoxStyle extends BoxStyle {
  scrollbarColor?: string
  scrollbarHoveredColor?: string
  scrollbarDisabledColor?: string

  // TODO: Support 'hide', 'show', and 'active'
  // TODO: Rename
  hideScrollY?: boolean
  hideScrollX?: boolean

  scrollYLocation?: Location.Left | Location.Right
  scrollXChar?: string
  scrollYChar?: string
}

export interface ScrollableBoxArgs extends BoxArgs {
  scrollX?: number
  scrollY?: number
  scrollXDisabled?: boolean
  scrollYDisabled?: boolean
  style?: ScrollableBoxStyle
}

export const DEFAULT_SCROLLABLE_BOX_SCROLLBAR_COLOR = color(200, 200, 200)
export const DEFAULT_SCROLLABLE_BOX_SCROLLBAR_HOVERD_COLOR = color(254, 254, 254)
export const DEFAULT_SCROLLABLE_BOX_SCROLLBAR_DISABLED_COLOR = color(120, 120, 120)
export const DEFAULT_SCROLLABLE_BOX_HIDE_VERTICAL_SCROLLBAR = false
export const DEFAULT_SCROLLABLE_BOX_HIDE_HORIZONTAL_SCROLLBAR = false
export const DEFAULT_SCROLLABLE_BOX_VERTICAL_SCROLLBAR_LOCATION = Location.Right
export const DEFAULT_SCROLLABLE_BOX_SCROLL_X_DISABLED = false
export const DEFAULT_SCROLLABLE_BOX_SCROLL_Y_DISABLED = false
export const DEFAULT_SCROLLABLE_BOX_SCROLL_X_CHAR = '█'
export const DEFAULT_SCROLLABLE_BOX_SCROLL_Y_CHAR = '█'

const SCROLL_INTERVAL_MS = 50

export class ScrollableBox extends Box {
  declare protected _style: ScrollableBoxStyle

  protected _scrollX: number = 0
  protected _scrollY: number = 0
  protected _scrollInterval: NodeJS.Timeout | null = null

  protected _isScrollYHovered: boolean = false
  protected _isScrollXHovered: boolean = false
  protected _isScrollYDisabled: boolean = false
  protected _isScrollXDisabled: boolean = false

  constructor(options: ScrollableBoxArgs) {
    super({
      ...options,

      style: {
        scrollbarColor: DEFAULT_SCROLLABLE_BOX_SCROLLBAR_COLOR,

        ...(options.style ?? {})
      }
    })

    const { style = {}, scrollXDisabled, scrollYDisabled } = options
    const {
      scrollXChar,
      scrollYChar,
      hideScrollY,
      hideScrollX,
      scrollbarColor,
      scrollYLocation,
      scrollbarHoveredColor,
      scrollbarDisabledColor,
    } = style

    this._style.scrollXChar = scrollXChar ?? DEFAULT_SCROLLABLE_BOX_SCROLL_X_CHAR
    this._style.scrollYChar = scrollYChar ?? DEFAULT_SCROLLABLE_BOX_SCROLL_Y_CHAR
    this._style.scrollbarColor = scrollbarColor ?? DEFAULT_SCROLLABLE_BOX_SCROLLBAR_COLOR
    this._style.hideScrollY = hideScrollY ?? DEFAULT_SCROLLABLE_BOX_HIDE_VERTICAL_SCROLLBAR
    this._style.hideScrollX = hideScrollX ?? DEFAULT_SCROLLABLE_BOX_HIDE_HORIZONTAL_SCROLLBAR
    this._style.scrollYLocation = scrollYLocation ?? DEFAULT_SCROLLABLE_BOX_VERTICAL_SCROLLBAR_LOCATION
    this._style.scrollbarHoveredColor = scrollbarHoveredColor ?? DEFAULT_SCROLLABLE_BOX_SCROLLBAR_HOVERD_COLOR
    this._style.scrollbarDisabledColor = scrollbarDisabledColor ?? DEFAULT_SCROLLABLE_BOX_SCROLLBAR_DISABLED_COLOR

    this._isScrollYDisabled = scrollYDisabled ?? DEFAULT_SCROLLABLE_BOX_SCROLL_Y_DISABLED
    this._isScrollXDisabled = scrollXDisabled ?? DEFAULT_SCROLLABLE_BOX_SCROLL_X_DISABLED
  }

  get scrollbarColor(): string {
    return this._style.scrollbarColor ?? DEFAULT_SCROLLABLE_BOX_SCROLLBAR_COLOR
  }

  get viewportRatioVertical(): number {
    return this.height / this.contentLines.length
  }

  get viewportRatioHorizontal(): number {
    return this.contentWidth / this.maxContentLineLength
  }

  get scrollHeight(): number {
    return Math.max(1, Math.floor(this.contentHeight * this.viewportRatioVertical))
  }

  get scrollWidth(): number {
    return Math.max(1, Math.floor(this.contentWidth * this.viewportRatioHorizontal))
  }

  get maxScrollY(): number {
    return this.contentLines.length - this.contentHeight
  }

  get maxScrollX(): number {
    return this.maxContentLineLength - this.contentWidth
  }

  get scrollYHeight(): number {
    return Math.max(1, Math.floor(this.contentHeight * this.viewportRatioVertical))
  }

  get scrollYPosition(): number {
    const scrollPosition = Math.min(this.scroll.y, this.contentLines.length - this.contentHeight)

    return Math.floor(
      (this.contentHeight - this.scrollYHeight) * (scrollPosition / this.maxScrollY)
    )
  }

  get scrollXWidth(): number {
    return Math.max(1, Math.floor(this.contentWidth * this.viewportRatioHorizontal))
  }

  get scrollXPosition(): number {
    const scrollPosition = Math.min(this.scroll.x, this.maxScrollX)

    return Math.floor(
      (this.contentWidth - this.scrollXWidth) * (scrollPosition / this.maxScrollX)
    )
  }

  // TODO: Refactor
  getRendered(): string[] {
    const width = this.contentWidth
    const height = this.contentHeight
    const lines = super.getRendered()

    if (this.hasScrollY()) {
      const y = this.scrollYPosition

      for (let i = 0; i < height; i++) {
        const char = i >= y && i < y + this.scrollHeight
          ? this._style.scrollYChar
          : this._style.scrollYLocation === Location.Left
            ? this.charBoxLeft
            : this.charBoxRight

        const line = lines[i + 1]

        lines[i + 1] = this._style.scrollYLocation === Location.Left
          ? `${char}${line.slice(1)}`
          : `${line.slice(0, -1)}${char}`
      }
    }

    if (this.hasScrollX()) {
      const x = this.scrollXPosition
      const line = lines[lines.length - 1]
      let newLine = line[0]

      for (let i = 0; i < width; i++) {
        const char = i >= x && i < x + this.scrollXWidth
          ? this._style.scrollXChar
          : this.charBoxBottom

        newLine += char
      }

      newLine += line[line.length - 1]
      lines[lines.length - 1] = newLine
    }

    return lines
  }

  set scrollX(scrollX: number) {
    this.scroll.x = Math.min(scrollX, this.maxContentLineLength)
  }

  set scrollY(scrollY: number) {
    this.scroll.y = Math.min(scrollY, this.contentLines.length)
  }

  set scrollXDisabled(isScrollXDisabled: boolean) {
    if (this._isScrollXDisabled === isScrollXDisabled) {
      this._isScrollXDisabled = isScrollXDisabled
      this.render()
    }
  }

  set scrollYDisabled(isScrollYDisabled: boolean) {
    if (this._isScrollYDisabled === isScrollYDisabled) {
      this._isScrollYDisabled = isScrollYDisabled
      this.render()
    }
  }

  onMouseWheelUp(_: TerminalMouseEvent): void {
    this.scrollUp()
  }

  onMouseWheelDown(_: TerminalMouseEvent): void {
    this.scrollDown()
  }

  scrollUp(): void {
    this.scroll.y = Math.max(0, this.scroll.y - 1)
    this.render()
  }

  scrollDown(): void {
    this.scroll.y = Math.min(this.contentLines.length - this.contentHeight - 1, this.scroll.y + 1)
    this.render()
  }

  private _startScrollInterval(direction: Direction): void {
    if (this._scrollInterval !== null) {
      clearInterval(this._scrollInterval)
    }

    this._scrollInterval = setInterval((): void => {
      if (direction === Direction.Up) {
        this.scrollUp()
      } else {
        this.scrollDown()
      }
    }, SCROLL_INTERVAL_MS)
  }

  private _stopScrollInterval(): void {
    if (this._scrollInterval !== null) {
      clearInterval(this._scrollInterval)
      this._scrollInterval = null
    }
  }

  onClick(data: TerminalMouseEvent): void {
    super.onClick(data)

    const { x: globalX, y: globalY } = data
    const x = globalX - this._position.x - 1
    const y = globalY - this._position.y - 1
    const scrollbarYStart = this.scrollYPosition + 1
    const scrollbarYEnd = scrollbarYStart + this.scrollYHeight

    if (this.hasScrollY()) {
      if (
        (this._style.scrollYLocation === Location.Right && x === this.width - 1) ||
        (this._style.scrollYLocation === Location.Left && x === 0)
      ) {
        if (y > scrollbarYStart && y <= scrollbarYEnd) {
          // TODO
        } else if (y <= scrollbarYStart) {
          this._startScrollInterval(Direction.Up)
        } else if (y > scrollbarYEnd) {
          this._startScrollInterval(Direction.Down)
        }
      }
    }
  }

  onClickEnd(_: TerminalMouseEvent): void {
    this._stopScrollInterval()
  }

  onHover(data: TerminalMouseEvent): void {
    super.onHover(data)

    const { x: globalX, y: globalY } = data
    const x = globalX - this._position.x - 1
    const y = globalY - this._position.y - 1

    this._isScrollYHovered = this.isScrollY(x, y)
    this._isScrollXHovered = this.isScrollX(x, y)
    this.render()
  }

  onHoverEnd(_: TerminalMouseEvent): void {
    this._isScrollYHovered = false
    this._isScrollXHovered = false
    this.render()
  }

  hasScrollX(): boolean {
    return !this._isScrollXDisabled && this.maxContentLineLength > this.contentWidth
  }

  hasScrollY(): boolean {
    return !this._isScrollYDisabled && this.contentLines.length > this.contentHeight
  }

  isScrollY(x: number, y: number): boolean {
    if (this.hasScrollY()) {
      return (
        (this._style.scrollYLocation === Location.Left && x === 0) ||
        (this._style.scrollYLocation === Location.Right && x === this.width - 1)
      ) && (
        y >= this.scrollYPosition + 1 &&
        y <= this.scrollYPosition + this.scrollYHeight
      )
    }

    return false
  }

  isScrollX(x: number, y: number): boolean {
    if (this.hasScrollX()) {
      return (
        y === this.height - 1
      ) && (
        x >= this.scrollXPosition + 1 &&
        x <= this.scrollXPosition + this.scrollXWidth
      )
    }

    return false
  }

  isScrollbar(x: number, y: number): boolean {
    return this.isScrollY(x, y) || this.isScrollX(x, y)
  }

  getCharColor(char: string, x: number, y: number): string {
    if (this.isScrollY(x, y)) {
      return this._isScrollYDisabled
        ? this._style.scrollbarDisabledColor ?? DEFAULT_SCROLLABLE_BOX_SCROLLBAR_DISABLED_COLOR
        : this._isScrollYHovered
          ? this._style.scrollbarHoveredColor ?? DEFAULT_SCROLLABLE_BOX_SCROLLBAR_HOVERD_COLOR
          : this._style.scrollbarColor ?? DEFAULT_SCROLLABLE_BOX_SCROLLBAR_COLOR
    } else if (this.isScrollX(x, y)) {
      return this._isScrollXDisabled
        ? this._style.scrollbarDisabledColor ?? DEFAULT_SCROLLABLE_BOX_SCROLLBAR_DISABLED_COLOR
        : this._isScrollXHovered
          ? this._style.scrollbarHoveredColor ?? DEFAULT_SCROLLABLE_BOX_SCROLLBAR_HOVERD_COLOR
          : this._style.scrollbarColor ?? DEFAULT_SCROLLABLE_BOX_SCROLLBAR_COLOR
    }

    return super.getCharColor(char, x, y)
  }
}

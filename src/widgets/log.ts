import { ScrollableBox } from './scrollable_box'

export class Log extends ScrollableBox {
  log(content: string): void {
    this.content = `${this.content}${this.content.length > 0 ? '\n' : ''}${content}`

    if (this.contentLines.length > this.contentHeight) {
      this.scroll.y = this.contentLines.length - this.contentHeight
    }

    this.render()
  }
}

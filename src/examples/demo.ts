import fs from 'fs'
import path from 'path'
import CLIBoxes from 'cli-boxes'

import { UI, Log, Box, Button, TextArea, TextAlign, VerticalAlign, ScrollableBox, type BoxArgs, Location } from '../'
import { color } from '../utils'

let README = fs.readFileSync(path.join(__dirname, '../../README.md'), 'utf-8')
README = README.slice(Math.floor(README.length / 2))

const run = async (): Promise<void> => {
  const ui = new UI(process.stdout)
  const getDemoBoxArgs = (options?: Partial<BoxArgs>): BoxArgs => ({
    ui,
    width: 20,
    height: 5,
    content: 'Box',
    position: {
      x: 0,
      y: 0,
      ...(options?.position ?? {})
    },

    ...(options ?? {})
  })

  const leftTopBox = new Box(getDemoBoxArgs({
    label: 'left-top',
    style: {
      textAlign: TextAlign.Left,
      verticalAlign: VerticalAlign.Top,
    },
  }))

  const centerTopBox = new Box(getDemoBoxArgs({
    position: { x: leftTopBox.width, y: 0 },
    label: 'center-top',
    style: {
      textAlign: TextAlign.Center,
      verticalAlign: VerticalAlign.Top,
    }
  }))

  new Box(getDemoBoxArgs({
    position: { x: leftTopBox.width + centerTopBox.width, y: 0 },
    label: 'right-top',
    style: {
      textAlign: TextAlign.Right,
      verticalAlign: VerticalAlign.Top,
    }
  }))

  const leftCenterBox = new Box(getDemoBoxArgs({
    position: { x: 0, y: 5 },
    label: 'left-center',
    style: {
      textAlign: TextAlign.Left,
      verticalAlign: VerticalAlign.Center,
    },
  }))

  const centerCenterBox = new Box(getDemoBoxArgs({
    position: { x: leftCenterBox.width, y: 5 },
    label: 'center-center',
    style: {
      textAlign: TextAlign.Center,
      verticalAlign: VerticalAlign.Center,
    }
  }))

  new Box(getDemoBoxArgs({
    position: { x: leftCenterBox.width + centerCenterBox.width, y: 5 },
    label: 'right-center',
    style: {
      textAlign: TextAlign.Right,
      verticalAlign: VerticalAlign.Center,
    }
  }))

  const leftBottomBox = new Box(getDemoBoxArgs({
    position: { x: 0, y: 10 },
    label: 'left-bottom',
    style: {
      textAlign: TextAlign.Left,
      verticalAlign: VerticalAlign.Bottom,
    },
  }))

  const centerBottomBox = new Box(getDemoBoxArgs({
    position: { x: leftBottomBox.width, y: 10 },
    label: 'center-bottom',
    style: {
      textAlign: TextAlign.Center,
      verticalAlign: VerticalAlign.Bottom,
    }
  }))

  new Box(getDemoBoxArgs({
    position: { x: leftBottomBox.width + centerBottomBox.width, y: 10 },
    label: 'right-bottom',
    style: {
      textAlign: TextAlign.Right,
      verticalAlign: VerticalAlign.Bottom,
    }
  }))

  const defaultButton = new Button({
    ui,
    content: 'Button',
    position: { x: 0, y: 15 },
  })

  const labeledButton = new Button({
    ui,
    label: 'Labeled',
    content: 'Button',
    position: { x: defaultButton.width, y: 15 },
  })

  const disabledButton = new Button({
    ui,
    label: 'Disabled',
    content: 'Button',
    disabled: true,
    position: { x: defaultButton.width + labeledButton.width, y: 15 },
  })

  new Button({
    ui,
    label: 'Custom Dimensions',
    content: 'Button',
    disabled: true,
    position: { x: defaultButton.width + labeledButton.width + disabledButton.width, y: 15 },
    width: 24,
  })

  new ScrollableBox({
    ui,
    label: 'Scrollable Box - Right',
    content: README,
    position: { x: 62, y: 0 },
    width: 30,
    height: 15,
  })

  new ScrollableBox({
    ui,
    label: 'Scrollable Box - Left',
    content: README,
    position: { x: 94, y: 0 },
    width: 30,
    height: 15,
    style: {
      scrollYLocation: Location.Left
    }
  })

  new ScrollableBox({
    ui,
    label: 'Scrollable Box - Disabled',
    content: README,
    position: { x: 126, y: 0 },
    width: 30,
    height: 15,
    scrollYDisabled: true,
    scrollXDisabled: true,
  })

  new ScrollableBox({
    ui,
    label: 'Scrollable Box - Single',
    content: README,
    position: { x: 62, y: 16 },
    width: 30,
    height: 15,
    style: {
      boxStyle: CLIBoxes.single,
      borderColor: color(254, 125, 125),
    }
  })

  new ScrollableBox({
    ui,
    label: 'Scrollable Box - Rounded',
    content: README,
    position: { x: 94, y: 16 },
    width: 30,
    height: 15,
    style: {
      boxStyle: CLIBoxes.round,
      borderColor: color(125, 125, 254),
    }
  })

  new ScrollableBox({
    ui,
    label: 'Scrollable Box - Double',
    content: README.split('').slice(Math.floor(README.length / 4)).join(''),
    position: { x: 126, y: 16 },
    width: 30,
    height: 15,
    style: {
      scrollYChar: '#',
      scrollbarColor: color(254, 200, 0),
      boxStyle: CLIBoxes.double,
      borderColor: color(125, 254, 125),
    }
  })

  new TextArea({
    ui,
    label: 'Text Area',
    position: { x: 0, y: 20 },
    width: 60,
    height: 10
  })

  const log = new Log({
    ui,
    label: 'Log',
    position: { x: 0, y: 31 },
    width: 60,
    height: 10
  })

  setInterval(() => {
    log.log('' + Math.random())
  }, 250)

  ui.hideCursor()
  ui.render(true)
}

// Give node time to render warnings on startup (experimental flags)
setTimeout(() => {
  run().catch((err: Error): void => {
    console.error(err?.message ?? err)
  })
}, 250)

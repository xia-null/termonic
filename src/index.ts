export * from './ui'
export * from './ansi'
export * from './types'
export * from './widget'
export * from './widgets'

// import fs from 'fs'
//
// import { UI } from './ui'
// import { Button, TextArea, Box } from './widgets'
//
// const README = fs.readFileSync(
//   '/home/f3rno64/.src/github/xia-null/termonic/README.md',
//   'utf-8'
// )
//
// const run = async (): Promise<void> => {
//   const ui = new UI(process.stdout)
//
//   new Button({
//     ui,
//     content: 'Press Me',
//     position: { x: 10, y: 25 }
//   })
//
//   new Box({
//     ui,
//     width: 100,
//     height: 10,
//     content: README,
//     position: { x: 54, y: 2 }
//   })
//
//   const textArea1 = new TextArea({
//     ui,
//     width: 50,
//     height: 5,
//     content: 'Test',
//     position: { x: 2, y: 14 }
//   })
//
//   new TextArea({
//     ui,
//     width: 50,
//     height: 5,
//     position: { x: 54, y: 14 }
//   })
//
//   new Box({
//     ui,
//     width: 50,
//     height: 10,
//     content: textArea1.content,
//     position: { x: 2, y: 2 }
//   })
//
//   ui.render(true)
// }
//
// run().catch((err: Error | string): void => {
//   console.error(err instanceof Error ? err.stack : err)
// })

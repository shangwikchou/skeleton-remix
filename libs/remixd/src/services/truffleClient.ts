import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
const { spawn } = require('child_process') // eslint-disable-line

export class TruffleClient extends PluginClient {
  methods: Array<string>
  websocket: WS
  currentSharedFolder: string

  constructor (private readOnly = false) {
    super()
    this.methods = ['compile']
  }

  setWebSocket (websocket: WS): void {
    this.websocket = websocket
  }

  sharedFolder (currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
  }

  compile () {
    return new Promise((resolve, reject) => {
      if (this.readOnly) {
        const errMsg = '[Truffle Compilation]: Cannot compile in read-only mode'
        return reject(new Error(errMsg))
      }
      const cmd = `truffle compile`
      const options = { cwd: this.currentSharedFolder, shell: true }
      const child = spawn(cmd, options)
      let result = ''
      let error = ''
      child.stdout.on('data', (data) => {
        const msg = `[Truffle Compilation]: ${data.toString()}`
        console.log('\x1b[32m%s\x1b[0m', msg)
        result += msg + '\n'
      })
      child.stderr.on('data', (err) => {
        error += `[Truffle Compilation]: ${err.toString()} \n`
      })
      child.on('close', () => {
        if (error && result) resolve(error + result)
        else if (error) reject(error)
        else resolve(result)
      })
    })
  }
}

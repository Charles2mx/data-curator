import {dialog as Dialog, BrowserWindow} from 'electron'
import Fs from 'fs'
import {enableSave, createWindowTabWithFormattedDataFile} from './utils'
let path = require('path')
const _ = require('lodash')
function makeCustomFormat(separator, delimiter) {
  // assemble a format object describing a custom format
  return {
    label: 'Custom',
    filters: [],
    options: {
      separator: separator,
      delimiter: delimiter
    },
    mime_type: 'text/plain',
    default_extension: 'txt'
  }
}

function saveAsCustom() {
  let currentWindow = BrowserWindow.getFocusedWindow()
  let dialog = new BrowserWindow({width: 200, height: 400})
  dialog.setMenu(null)
  dialog.once('closed', function() {
    ipc.removeAllListeners('formatSelected')
    dialog = null
  })
  ipc.once('formatSelected', function(event, data) {
    dialog.close()
    let format = makeCustomFormat(data.separator, data.delimiter)
    saveFileAs(format, currentWindow)
  })
  dialog.loadURL(`http://localhost:9080/#/customformat`)
}

function saveFileAs(format, currentWindow) {
  if (!currentWindow) {
    currentWindow = BrowserWindow.getFocusedWindow()
  }
  Dialog.showSaveDialog({
    filters: format.filters,
    defaultPath: global.tab.activeTitle
  }, function(filename) {
    if (filename === undefined) {
      // console.log('returning as no filename was entered...')
      return
    }
    if (savedFilenameExists(filename)) {
      Dialog.showMessageBox(currentWindow, {
        type: 'warning',
        // title is not displayed on screen on macOS
        title: 'Data not saved',
        message:
`The data was not saved to the file.
You selected a file name that is already used in this Data Package.
To save the data, choose a unique file name.`
      })
      return
    }
    // enableSave()
    currentWindow.webContents.send('saveData', format, filename)
    currentWindow.format = format
    currentWindow.webContents.send('saveDataSuccess')
  })
}

function savedFilenameExists(filename) {
  let threshold = global.tab.activeFilename === filename ? 1 : 0
  let length = global.tab.filenames.length
  let filtered = _.without(global.tab.filenames, filename)
  return length - filtered.length > threshold
}

function saveFile() {
  let currentWindow = BrowserWindow.getFocusedWindow()
  currentWindow.webContents.send('saveData', currentWindow.format, global.tab.activeFilename)
}

function openCustom() {
  // var window = BrowserWindow.getFocusedWindow()
  let dialog = new BrowserWindow({width: 200, height: 400})
  dialog.setMenu(null)
  dialog.once('closed', function() {
    ipc.removeAllListeners('formatSelected')
    dialog = null
  })
  ipc.once('formatSelected', function(event, data) {
    dialog.close()
    var format = makeCustomFormat(data.separator, data.delimiter)
    openFile(format)
  })
  dialog.loadURL(`http://localhost:9080/#/customformat`)
}

export function importDataPackage() {
  Dialog.showOpenDialog({
    filters: [
      {
        name: '*',
        extensions: ['zip']
      }
    ],
    properties: ['openFile']
  }, function(filename) {
    if (filename === undefined) {
      return
    }
    let window = BrowserWindow.getFocusedWindow()
    window.webContents.send('importDataPackage', filename)
  })
}

function openFile(format) {
  Dialog.showOpenDialog({
    filters: format.filters
  }, function(filenames) {
    readFile(filenames, format)
  })
}

function openedFilenameExists(filename) {
  return _.indexOf(global.tab.filenames, filename) > -1
}

function readFile(filenames, format) {
  if (filenames !== undefined) {
    let filename = filenames[0]
    if (openedFilenameExists(filename)) {
      Dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: 'warning',
        // title is not displayed on screen on macOS
        title: 'File not opened',
        message: `The file was not opened.
You selected a file name that is already used in this Data Package.
A file may only be opened once.`
      })
      return
    }
    Fs.readFile(filename, 'utf-8', function(err, data) {
      if (err) {
        console.log(err.stack)
      } else {
        createWindowTabWithFormattedDataFile(data, format, filename)
        // enableSave()
      }
    })
  }
}

export {
  openFile,
  openCustom,
  readFile,
  saveFileAs,
  saveAsCustom,
  saveFile
}

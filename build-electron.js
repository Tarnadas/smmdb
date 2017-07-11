const packager = require('electron-packager')
const fs = require('fs')
const path = require('path')

packager({
  dir: './build',
  arch: 'x64',
  platform: 'win32',
  icon: './build/static/images/app_icon.ico',
  overwrite: true
}, (err, appPaths) => {
  if (err) throw err
  fs.createReadStream('./package.json').pipe(fs.createWriteStream(path.join(appPaths[0], 'resources/app/package.json')))
})

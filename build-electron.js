const packager = require('electron-packager')
const fs = require('fs')
const path = require('path')

const packageJson = JSON.parse(fs.readFileSync('./package.json'))
const out = path.normalize(`./build/release/${packageJson.clientVersion}`)
if (!fs.existsSync(out)) {
  fs.mkdirSync(out)
}

packager({
  dir: './build/electron',
  out,
  arch: 'x64',
  platform: 'win32',
  appVersion: packageJson.clientVersion,
  icon: './build/static/images/app_icon.ico',
  overwrite: true
}, (err, appPaths) => {
  if (err) throw err
  packageJson.main = 'main.js'
  fs.writeFileSync(path.join(appPaths[0], 'resources/app/package.json'), JSON.stringify(packageJson))
  fs.mkdirSync(path.join(appPaths[0], `resources/static`))
  fs.mkdirSync(path.join(appPaths[0], `resources/static/images`))
  fs.mkdirSync(path.join(appPaths[0], `resources/static/styles`))
  fs.readdirSync('./build/static/images').map(val => `./build/static/images/${val}`).concat(fs.readdirSync('./build/static/styles').map(val => `./build/static/styles/${val}`)).forEach(file => {
    fs.createReadStream(file).pipe(fs.createWriteStream(path.join(appPaths[0], `resources/static/${file.split('static/')[1]}`)))
  })
})

const child_process = require('child_process')
const { promisify } = require('util')

const { username, password } = require('./.mongorc.json')

const spawn = child_process.spawn
const exec = promisify(child_process.exec)

const main = async () => {
  const mongoDumpPath = '/root/backup'
  await mongoDump(mongoDumpPath)

  const date = new Date().toISOString().split(".")[0]
  const backupFile = `dump_${date}.tar.gz`
  const backupFilePath = '/root/backups'
  await tarCompress(backupFile, backupFilePath, mongoDumpPath)

  await megaPut(backupFile, backupFilePath)

  await exec(`rm ${backupFilePath}/${backupFile}`)
}

const mongoDump = (mongoDumpPath) =>
  new Promise((resolve, reject) => {
    const spawnMongoDump = spawn(
      'docker',
      [ 'run', '--rm', '--network=webproxy', '--link', 'mongodb:mongodb', '-v', `${mongoDumpPath}:/backup`, 'mongo', 'bash', '-c', 'mongodump --out /backup --host mongodb' ]
    )
    spawnMongoDump.stdout.on('data', data => {
      console.info(String(data))
    })
    spawnMongoDump.stderr.on('data', data => {
      console.info(String(data))
    })
    spawnMongoDump.on('close', code => {
      if (code === 0) resolve()
      reject(code)
    })
  })

const tarCompress = (backupFile, backupFilePath, mongoDumpPath) =>
  new Promise((resolve, reject) => {
    const spawnTarCompress = spawn(
      'tar',
      [ '-zcvf', `${backupFilePath}/${backupFile}`, mongoDumpPath ]
    )
    spawnTarCompress.stdout.on('data', data => {
      console.info(String(data))
    })
    spawnTarCompress.stderr.on('data', data => {
      console.info(String(data))
    })
    spawnTarCompress.on('close', code => {
      if (code === 0) resolve()
      reject(code)
    })
  })

const megaPut = (backupFile, backupFilePath) =>
  new Promise((resolve, reject) => {
    const spawnMegaPut = spawn(
      'megaput',
      [ '--path', '/Root/smmdb', '-u', username, '-p', password, `${backupFilePath}/${backupFile}` ]
    )
    spawnMegaPut.stdout.on('data', data => {
      console.info(String(data))
    })
    spawnMegaPut.stderr.on('data', data => {
      console.info(String(data))
    })
    spawnMegaPut.on('close', code => {
      if (code === 0) resolve()
      reject(code)
    })
  })

try {
  main()
} catch (err) {
  console.error(err)
}

#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const EXCLUDED = new Set(['accounts', 'amazon'])

function usage() {
  console.error('Usage: node scripts/sanitize-backup.js <input-dump-dir> <output-dump-dir>')
  console.error('')
  console.error('Copies a mongodump directory (as produced by mongodump --out <dir>)')
  console.error('to <output-dump-dir>, dropping collections that contain sensitive data:')
  console.error('  accounts (emails, google ids, api keys, id tokens)')
  console.error('  amazon   (product URLs embedding the Product Advertising API key)')
  process.exit(1)
}

function sanitize(inputDir, outputDir) {
  if (!fs.existsSync(inputDir) || !fs.statSync(inputDir).isDirectory()) {
    console.error(`Input directory does not exist or is not a directory: ${inputDir}`)
    process.exit(1)
  }
  fs.mkdirSync(outputDir, { recursive: true })

  const files = fs.readdirSync(inputDir)
  let copiedBytes = 0
  let copiedFiles = 0
  let skippedFiles = 0

  for (const file of files) {
    const collection = file.replace(/\.metadata\.json$/, '').replace(/\.bson$/, '')
    if (EXCLUDED.has(collection)) {
      console.log(`skipping ${file}`)
      skippedFiles += 1
      continue
    }
    const src = path.join(inputDir, file)
    const dst = path.join(outputDir, file)
    const size = fs.statSync(src).size
    console.log(`copying ${file} (${(size / 1024 / 1024).toFixed(1)} MB)`)
    fs.copyFileSync(src, dst)
    copiedBytes += size
    copiedFiles += 1
  }

  console.log('')
  console.log(`Done. ${copiedFiles} files (${(copiedBytes / 1024 / 1024 / 1024).toFixed(2)} GB) copied, ${skippedFiles} files skipped.`)
  console.log(`Sanitized dump written to: ${outputDir}`)
  console.log('')
  console.log('Next steps:')
  console.log('  1. (optional) re-compress: 7z a backup-sanitized.7z <output-dump-dir>')
  console.log('  2. restore into a running mongo: mongorestore --drop --uri mongodb://<host> <output-dump-dir>')
}

const args = process.argv.slice(2)
if (args.length !== 2) usage()
sanitize(path.resolve(args[0]), path.resolve(args[1]))

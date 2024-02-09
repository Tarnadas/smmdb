module.exports = function ({ENVIRONMENT}) {
  // console.log('env', env)
  return require(`./config/webpack.${ENVIRONMENT}.js`)
}

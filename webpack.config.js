module.exports = function(env) {
  return require(`./config/webpack.${env}.js`)
}
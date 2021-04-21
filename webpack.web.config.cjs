const getConfig = require('startupjs/bundler.cjs').webpackWebConfig

module.exports = getConfig(undefined, {
  forceCompileModules: ['@startupjs/auth', '@startupjs/auth-local'],
  alias: {},
  mode: 'react-native'
})

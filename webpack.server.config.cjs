const getConfig = require('startupjs/bundler.cjs').webpackServerConfig

module.exports = getConfig(undefined, {
  forceCompileModules: ['@startupjs/auth/server', '@startupjs/auth/isomorphic', '@startupjs/auth-local/server'],
  alias: {}
})

import init from 'startupjs/init'
import startupjsServer from 'startupjs/server'
import { initApp } from 'startupjs/app/server'
import { initAuth } from '@startupjs/auth/server'
import { getAuthRoutes } from '@startupjs/auth/isomorphic'
import { Strategy as LocalStrategy } from '@startupjs/auth-local/server'
import orm from '../model'
import api from './api'
import getPlayerRoutes from '../appPlayer/routes'
import getAdminRoutes from '../appAdmin/routes'

// Init startupjs ORM.
init({ orm })

// Check '@startupjs/server' readme for the full API
startupjsServer({
  getHead,
  appRoutes: [
    ...getPlayerRoutes(),
    ...getAdminRoutes(),
    ...getAuthRoutes()
  ]
}, (ee, options) => {
  initApp(ee)
  initAuth(ee, {
    // todo fix @startupjs/auth/BaseProvider to allow get custom fields in parseUserCreationData hook
    // from userData object from creation form
    // here simple pack more data in lastName string
    parseUserCreationData: (fields) => {
      const customDataPackArray = fields.lastName.split('|')
      return { lastName: customDataPackArray[0], adminFlag: customDataPackArray[1] === 'true' }
    },
    strategies: [
      new LocalStrategy({
        onCreatePasswordResetSecret: (userId, secret) => {
          // callback
        },
        onPasswordReset: userId => {
          // callback
        },
        onPasswordChange: userId => {
          // callback
        },
        onCreateEmailChangeSecret: (userId, secret) => {
          // callback
        },
        onEmailChange: userId => {
          // callback
        }
      })
    ]
  })
  ee.on('routes', expressApp => {
    expressApp.use('/api', api)
  })
})

function getHead (appName) {
  return `
    <title>App</title>
    <!-- Put vendor JS and CSS here -->
  `
}

export default function run () {}

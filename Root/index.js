import { BASE_URL } from '@env'
import init from '@startupjs/init'
import { initAuthApp } from '@startupjs/auth'
import * as localForms from './appAuthForms'
import orm from '../model'
import React from 'react'
import App from 'startupjs/app'
import { observer, model } from 'startupjs'
import { Platform } from 'react-native'

// Frontend micro-services
import * as playerApp from '../appPlayer'
import * as adminApp from '../appAdmin'

const authApp = initAuthApp({
  localForms
})
// change default register page + proffesor field
// authApp.routes = authApp.routes.filter(item => item.path !== '/auth/sign-up')

if (Platform.OS === 'web') window.model = model

// Init startupjs connection to server and the ORM.
// baseUrl option is required for the native to work - it's used
// to init the websocket connection and axios.
// Initialization must start before doing any subscribes to data.
init({ baseUrl: BASE_URL, orm })

export default observer(() => {
  return pug`
    App(
      apps={authApp, playerApp, adminApp}
    )
  `
})

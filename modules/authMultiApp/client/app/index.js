import React from 'react'
import { BASE_URL } from '@env'
import * as pages from './pages'
import { getAuthRoutes } from '../../isomorphic'

import Layout from './Layout'

export default function initAuthApp ({
  appId = '',
  baseUrl = BASE_URL,
  localForms,
  socialButtons,
  configs,
  logo,
  redirectUrl,
  onChangeAuthPage
}) {
  const routes = getAuthRoutes(pages, appId).map(item => {
    const Page = item.component
    item.component = () => {
      return pug`
        Page(
          baseUrl=baseUrl
          logo=logo
          configs=configs
          localForms=localForms
          socialButtons=socialButtons
          redirectUrl=redirectUrl
          onChangeAuthPage=onChangeAuthPage
        )
      `
    }
    return item
  })

  return { routes, Layout }
}

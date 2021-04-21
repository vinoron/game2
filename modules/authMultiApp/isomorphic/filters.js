import { SIGN_IN_URL } from './constants'

function isLoggedIn ({ signInPageUrl, appId }) {
  console.debug('I MA HEEREE', signInPageUrl, SIGN_IN_URL)
  return function (model, next, redirect) {
    const loggedIn = model.get(`_session.${appId}loggedIn`)
    console.debug('is logged in?', loggedIn)
    if (!loggedIn) return redirect(signInPageUrl || `/${appId}/SIGN_IN_URL`)
    next()
  }
}

function isNotLoggedIn ({ redirectUrl, appId }) {
  return function (model, next, redirect) {
    const loggedIn = model.get(`_session.${appId}loggedIn`)
    const successRedirectUrl =
      redirectUrl || `/${appId}/${model.get('_session.auth.successRedirectUrl')}` || '/'
    if (loggedIn) return redirect(successRedirectUrl)
    next()
  }
}

export default {
  isLoggedIn,
  isNotLoggedIn
}

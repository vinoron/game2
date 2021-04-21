const signInPage = '/auth/sign-in'
const adminRootPage = '/admin/games'

function isLoggedAsPlayer (signInPageUrl, adminPageUrl) {
  return async function (model, next, redirect) {
    const loggedIn = model.get('_session.loggedIn')
    if (!loggedIn) return redirect(signInPageUrl)
    const userId = model.get('_session.userId')
    const $user = model.scope('users.' + userId)
    await model.fetchAsync($user)
    const user = $user.get()
    const isAdmin = user.adminFlag
    if (isAdmin) return redirect(adminPageUrl)
    next()
  }
}

export default (components = {}) => [
  {
    path: '/', // place for special main page in future
    exact: true,
    redirect: '/games'
  },
  {
    path: '/games',
    exact: true,
    component: components.PGames,
    filters: [isLoggedAsPlayer(signInPage, adminRootPage)]
  },
  {
    path: '/past-games',
    exact: true,
    component: components.PPastGames,
    filters: [isLoggedAsPlayer(signInPage, adminRootPage)]
  },
  {
    path: '/games/:id',
    exact: true,
    component: components.PGame,
    filters: [isLoggedAsPlayer(signInPage, adminRootPage)]
  }
]

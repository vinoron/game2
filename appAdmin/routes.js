const signInPage = '/auth/sign-in'
const playerRootPage = '/games'

function isLoggedAsAdmin (signInPageUrl, playerPageUrl) {
  return async function (model, next, redirect) {
    const loggedIn = model.get('_session.loggedIn')
    if (!loggedIn) return redirect(signInPageUrl)
    const userId = model.get('_session.userId')
    const $user = model.scope('users.' + userId)
    await model.fetchAsync($user)
    const user = $user.get()
    const isPlayer = !user.adminFlag
    if (isPlayer) return redirect(playerPageUrl)
    next()
  }
}

export default (components = {}) => [
  {
    path: '/admin',
    exact: true,
    redirect: '/admin/games'
  },
  {
    path: '/admin/games',
    exact: true,
    component: components.PAdminGames,
    filters: [isLoggedAsAdmin(signInPage, playerRootPage)]
  },
  {
    path: '/admin/games/:id',
    exact: true,
    component: components.PAdminGame,
    filters: [isLoggedAsAdmin(signInPage, playerRootPage)]
  },
  {
    path: '/admin/create-game/:templateId',
    exact: true,
    component: components.PCreateGame,
    filters: [isLoggedAsAdmin(signInPage, playerRootPage)]
  },
  {
    path: '/admin/library',
    exact: true,
    component: components.PTemplates,
    filters: [isLoggedAsAdmin(signInPage, playerRootPage)]
  },
  {
    path: '/admin/create-template',
    exact: true,  
    component: components.PCreateTemplate,
    filters: [isLoggedAsAdmin(signInPage, playerRootPage)]
  },
  {
    path: '/admin/create-template/:templateId',
    exact: true,
    component: components.PCreateTemplate,
    filters: [isLoggedAsAdmin(signInPage, playerRootPage)]
  },
  // {
  //   path: '/admin/past-games',
  //   exact: true,
  //   component: components.PPastAdminGames,
  //   filters: [filters.isLoggedIn(signInPage)]
  // },
  // {
  //   path: '/auth/sign-up',
  //   exact: true,
  //   component: components.PHighscores
  //   // filters: [filters.isLoggedIn(signInPage)]
  // }
]

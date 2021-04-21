import filters from './filters'

export default (components = {}, appId = '') => [
  {
    path: `/${appId}/auth/sign-in`,
    exact: true,
    component: components.PSignIn,
    filters: [filters.isNotLoggedIn({ appId })]
  },
  {
    path: `/${appId}/auth/sign-up`,
    exact: true,
    component: components.PSignUp,
    filters: [filters.isNotLoggedIn({ appId })]
  },
  {
    path: `/${appId}/auth/recover`,
    exact: true,
    component: components.PRecover,
    filters: [filters.isNotLoggedIn({ appId })]
  },
  {
    path: `/${appId}/auth/reset-password`,
    exact: true,
    component: components.PResetPassword,
    filters: [filters.isNotLoggedIn({ appId })]
  }
]

import React from 'react'
import { Div, Menu, Link, Span } from '@startupjs/ui'
import { onLogout } from '@startupjs/auth'

import './index.styl'

const { Item: MenuItem } = Menu
const items = [
  { title: 'GAMES', url: '/admin/games' },
  { title: 'PAST GAMES', url: '/admin/past-games' },
  { title: 'LIBRARY', url: '/admin/library' }
]

const LeftMenuAdmin = () => {
  return pug`
    Div.root
      Menu.menu
        each item, index in items
          MenuItem.mi(key=index)
            Link.m(to=item.url) #{item.title}
        MenuItem.mi
          Span.m(onPress=onLogout) #{'Logout'}

    `
}
export default LeftMenuAdmin

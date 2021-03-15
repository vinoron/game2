import React from 'react'
import { Div, Menu, Link } from '@startupjs/ui'
import { onLogout } from '@startupjs/auth'

import './index.styl'

const { Item: MenuItem } = Menu
const items = [
  { title: 'GAMES', url: '/games' },
  { title: 'PAST GAMES', url: '/past-games' }
]

const LeftMenu = () => {
  return pug`
    Div.root
      Menu.menu
        each item, index in items
          MenuItem.mi(key=index)
            Link.m(to=item.url) #{item.title}
        MenuItem.mi
          Link.m(onPress=onLogout) #{'Logout'}

    `
}
export default LeftMenu

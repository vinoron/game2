import React from 'react'
import { Div } from '@startupjs/ui'
import { useLocal } from '@startupjs/react-sharedb'

import PageSlogan from 'components/PageSlogan'
import GameList from 'components/GameList'

import './index.styl'

const PAdminGames = () => {
  const [user] = useLocal('_session.user')

  return pug`
    Div.root
      PageSlogan(text=('Welcome Professor '+user.firstName+' '+user.lastName))
      Div
        GameList(mode='admin')
  `
}

export default PAdminGames

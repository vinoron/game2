import React from 'react'
import { withRouter } from 'react-router'
import { Div, Button } from '@startupjs/ui'
import { useLocal } from '@startupjs/react-sharedb'

import PageSlogan from 'components/PageSlogan'
import GameList from 'components/GameList'

import './index.styl'

const PAdminGames = ({ history }) => {
  const [user] = useLocal('_session.user')
  const goCreate = () => {
    history.push('/admin/create-game')
  }

  const goPast = () => {
    history.push('/admin/past-games')
  }

  return pug`
    Div.root
      PageSlogan(text=('Welcome Professor '+user.firstName+' '+user.lastName))
      Div
        Button.createBtn(color='primary' variant='flat' onClick=goCreate) #{'CREATE GAME'}
        GameList(mode='admin')
        Button.pastBtn(color='primary' variant='flat' onClick=goPast) #{'PAST GAMES'}
  `
}

export default withRouter(PAdminGames)

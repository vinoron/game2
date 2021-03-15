import React from 'react'
import { withRouter } from 'react-router'
import { Div, Button } from '@startupjs/ui'
import { observer, useLocal } from '@startupjs/react-sharedb'
import PageSlogan from 'components/PageSlogan'
import GameList from 'components/GameList'
import './index.styl'

const PGames = ({ history }) => {
  const [user] = useLocal('_session.user')

  const goPast = () => {
    history.push('/past-games')
  }

  return pug`
    Div.root
      PageSlogan(text=('Welcome, '+user.firstName+' '+user.lastName))
      GameList(mode="user")
      Button.pastBtn(color='primary' variant='flat' onClick=goPast) #{'PAST GAMES'}
  `
}
export default withRouter(observer(PGames))

import React from 'react'
import { Div } from '@startupjs/ui'
import { observer, useDoc, useLocal, useValue } from '@startupjs/react-sharedb'

import PageSlogan from 'components/PageSlogan'
import GameList from 'components/GameList'

import { PLAYERS_COLLECTION } from '../../../const/default'

import './index.styl'

const PPastGames = () => {
  const [userId] = useLocal('_session.userId')
  const [player] = useDoc(PLAYERS_COLLECTION, userId)

  if (!player) {
    return pug`
      Div.root
        PageSlogan(text=('YOU HAVE NOT GAMES'))
    `
  }

  return pug`
    Div.root
      PageSlogan(text=('PAST GAMES FOR '+player.firstName))
      GameList(mode="user" active=false)
  `
}
export default observer(PPastGames)

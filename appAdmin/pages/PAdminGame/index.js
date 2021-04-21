import React from 'react'
import { Div } from '@startupjs/ui'
import AdminGame from 'components/AdminGame'
import PageSlogan from 'components/PageSlogan'

import './index.styl'

const PAdminGame = () => {
  return pug`
    Div.root
      PageSlogan(text='PROFESSOR GAME CONTROL')
      AdminGame
  `
}
export default PAdminGame

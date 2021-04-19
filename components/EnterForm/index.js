import React from 'react'
import { withRouter } from 'react-router'
import { useLocal, observer } from 'startupjs'
import { Div, Button } from '@startupjs/ui'

import Title from 'components/Title'

import './index.styl'

const EnterForm = ({ id, history }) => {
  const [user, $user] = useLocal('$game.user')
  const [adminFlag] = useLocal('session.user.adminFlag')

  const onEnter = () => {
    if (adminFlag) {
      history.push('/admin')
    } else {
      history.push('/games')
      if (!user) {
        $user.set({ name: '' })
      }
    }
  }

  return pug`
    Div.root
      Title Let's start!
      
      Div.enter
        Button.button(onClick=onEnter variant='flat') #{'ENTER'}
  `
}
export default withRouter(observer(EnterForm))

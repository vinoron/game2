import React, { useEffect } from 'react'
import { ImageBackground } from 'react-native'
import { withRouter } from 'react-router'
import { useSession, observer, $root } from 'startupjs'
import { Layout, Div, DrawerSidebar, Row, Button } from '@startupjs/ui'
import { SuccessRedirect } from '@startupjs/auth'
import { BASE_URL } from '@env'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import LeftMenuAdmin from 'components/LeftMenuAdmin'
import { SIDEBAR_KEY } from '../../const/default'

import './index.styl'

const MainLayout = ({ match, children }) => {
  const isAdmin = $root.get('_session.user.adminFlag')
  if (!isAdmin) {
    return pug`
      Div #{'No Access'}
    `
  }
  const [, $open] = useSession(SIDEBAR_KEY)
  const onPress = () => $open.set(true)
  const pic = `${BASE_URL}/img/bg04.jpg`

  const getMenu = () => pug`
    LeftMenuAdmin
  `
  useEffect(() => {
    $open.set(false)
  }, [match.params])

  return pug`
    Layout.root
      ImageBackground.bg(
        source={uri: pic}
        imageStyleName='bgImage'
        resizeMode="cover"
      )
        DrawerSidebar(
          $open=$open
          width=240
          defaultOpen=false
          renderContent=getMenu
        )
          Div.content
            Row.sidebarLine
              Button.bars(onPress=onPress variant='flat' icon=faBars)
            Row
              SuccessRedirect
                =children
  `
}

export default withRouter(observer(MainLayout))

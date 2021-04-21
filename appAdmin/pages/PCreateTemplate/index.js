import React from 'react'
import { withRouter } from 'react-router'
import { Div } from '@startupjs/ui'

import PageSlogan from 'components/PageSlogan'
import CreateTemplateForm from 'components/CreateTemplateForm'

import './index.styl'

const PCreateTemplate = ({ match: { params } }) => {
  return pug`
    Div.root
      PageSlogan(text='CREATE GAME TEMPLATE')
      CreateTemplateForm(id=params.id)

  `
}
export default withRouter(PCreateTemplate)

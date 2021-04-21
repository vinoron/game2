import React from 'react'
import { withRouter } from 'react-router'
import { Div, Button } from '@startupjs/ui'
import PageSlogan from 'components/PageSlogan'
import TemplateList from 'components/TemplateList'

import './index.styl'

const PTemplates = ({ history }) => {
  const goCreate = () => {
    history.push('/admin/create-template')
  }

  return pug`
    Div.root
      PageSlogan(text=('Library'))
      Button.createBtn(color='primary' variant='flat' onClick=goCreate) #{'CREATE TEMPLATE'}
      TemplateList
  `
}
export default withRouter(PTemplates)

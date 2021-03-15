import React, { useCallback } from 'react'
import { withRouter } from 'react-router'
import { Div, Span, TextInput, Button } from '@startupjs/ui'
import { useValue, useDoc, observer, useLocal } from '@startupjs/react-sharedb'
import Title from 'components/Title'
import { TEMPLATES_COLLECTION } from '../../const/default'
import './index.styl'

const exampleTemplate = {
  roles: ['boss', 'emploee', 'HR manager'],
  rounds: 5,
  questions: [
    { title: 'Сколько нужно новых сотрудников', type: 'number', roles: ['boss'], equation: '' },
    { title: 'Сколько собеседований провел в день', type: 'number', roles: ['HR manager'], equation: '' },
    { title: 'Сколько канализационных люков в городе', type: 'number', roles: ['emploee'], equation: '' }
  ]
}

const CreateTemplateForm = ({ match: { params }, history }) => {
  const [template, $template] = useDoc(TEMPLATES_COLLECTION, params.templateId)
  const [user] = useLocal('_session.user')
  const [formData, $formData] = useValue(params.templateId ? { ...template } : {})
  const onSetFormValue = useCallback(
    (key) => (value) => {
      $formData.setEach({ [key]: value })
    }, [])

  const onSave = async () => {
    if (params.templateId) {
      $template.setEach(formData)
      history.push('/admin/library')
    } else {
      $formData.setEach({ adminId: user.id, creatorName: `${user.firstName} ${user.lastName}` })
      await $template.create(formData)
      history.push('/admin/library')
    }
  }

  return pug`
    Div.root
      Title Create new template
      TextInput.input(placeholder='Template Name' onChangeText=onSetFormValue('name') value=formData.name)
      TextInput.input(placeholder='Template description' onChangeText=onSetFormValue('description') value=formData.description)
      TextInput.input(placeholder='Template' multiline numberOfLines=10 onChangeText=onSetFormValue('template') value=formData.template)
      Div
        Span #{'Example'}
      TextInput.input(multiline numberOfLines=5 readonly value=JSON.stringify(exampleTemplate, null, 4))
      Div.footer
        Button.button(onClick=onSave) #{params.templateId ? 'UPDATE' : 'CREATE'}
  `
}
export default withRouter(observer(CreateTemplateForm))

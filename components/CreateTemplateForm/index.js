import React, { useCallback } from 'react'
import { withRouter } from 'react-router'
import { useValue, useDoc, observer, useLocal } from 'startupjs'
import { Div, Span, TextInput, Button } from '@startupjs/ui'
import Title from 'components/Title'
import { TEMPLATES_COLLECTION } from '../../const/default'
import './index.styl'

const exampleTemplate = {
  "roles": [
      "A",
      "B"
  ],
  "rounds": 2,
  "questions": [
      {
          "title": "Сотрудничать?",
          "type": "enum",
          "values": [["Да", 1],["Нет", 0]],
          "roles": [
          ]
      }
  ],
 "equation": "const D=10; const C=2; const d=0.5; const c=0; if (answers[0]['A'] && answers[0]['B']) result = [C, C];  if (!answers[0]['A'] && answers[0]['B']) result = [D, c];  if (answers[0]['A'] && !answers[0]['B']) result = [c, D];  if (!answers[0]['A'] && !answers[0]['B']) result = [d, d];"
}

const CreateTemplateForm = ({ match: { params }, history }) => {
  const [template, $template] = useDoc(TEMPLATES_COLLECTION, params.templateId)
  const [user] = useLocal('_session.user')
  const [formData, $formData] = useValue(params.templateId ? { ...template } : {})
  const onSetFormValue = useCallback(
    (key) => (value) => {
      $formData.set(key, value)
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
        Span #{'Example PRISONER\'s GAME '}
      TextInput.input(multiline numberOfLines=5 readonly value=JSON.stringify(exampleTemplate, null, 4))
      Div.footer
        Button.button(onClick=onSave) #{params.templateId ? 'UPDATE' : 'CREATE'}
  `
}
export default withRouter(observer(CreateTemplateForm))

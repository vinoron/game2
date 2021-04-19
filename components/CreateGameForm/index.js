import React, { useCallback } from 'react'
import { withRouter } from 'react-router'
import { useValue, useDoc, observer, useLocal } from 'startupjs'
import { Div, TextInput, Button } from '@startupjs/ui'
import Title from 'components/Title'
import { GAMES_COLLECTION } from '../../const/default'
import './index.styl'

const CreateGameForm = ({ match: { params }, id, history }) => {
  const [game = {}, $game] = useDoc(GAMES_COLLECTION, id)
  const [user] = useLocal('_session.user')
  const [formData, $formData] = useValue({ ...game })
  const onSetFormValue = useCallback(
    (key) => (value) => {
      $formData.set(key, value)
    }, [])

  const onSave = async () => {
    if (id) {
      $game.setEach(formData)
      history.push('/admin/library')
    } else {
      $formData.setEach({ adminId: user.id, creatorName: `${user.firstName} ${user.lastName}`, templateId: params.templateId })
      await $game.create(formData)
      history.push('/admin/library')
    }
  }

  return pug`
    Div.root
      if formData.startedAt
        Title Game already started
      else 
        Title Create new game by template
        TextInput.input(placeholder='Game Name' onChangeText=onSetFormValue('name') value=formData.name)
        TextInput.input(placeholder='Description' multiline numberOfLines=3 onChangeText=onSetFormValue('description') value=formData.description)
        Div.footer
          Button.button(onClick=onSave) #{id ? 'UPDATE' : 'CREATE'}
  `
}
export default withRouter(observer(CreateGameForm))

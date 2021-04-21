import React from 'react'
import { useValue, useDoc, observer, useLocal, useQuery } from 'startupjs'
import { Div, Span, TextInput, Button, Row } from '@startupjs/ui'
import { CHAT_COLLECTION, PLAYERS_COLLECTION } from '../../const/default'
import './index.styl'

const Chat = ({ id }) => {
  const [chat, $chat] = useDoc(CHAT_COLLECTION, id)
  const [user] = useLocal('_session.user')
  const query = { $or: [{ _id: { $in: chat.players.map(p => p.userId) } }] }
  const [players] = useQuery(PLAYERS_COLLECTION, query)
  const [text, $text] = useValue('')
  const onSetText = t => {
    $text.set(t)
  }

  const playersById = {}
  players.forEach(p => {
    playersById[p.id] = p
  })

  const onSendMessage = () => {
    if (chat.players.find(u => u.userId === user.id)) {
      $chat.set('messages', [...chat.messages, {
        message: text,
        userId: user.id
      }])
      $text.set('')
    }
  }

  return pug`
    Div.root
      Div.messages
        each message in chat.messages
          Row.message(key=message.id)
            - const messageUser = playersById[message.userId]
            Span.author #{messageUser.firstName} #{messageUser.lastName}#{': '}
            Span.text #{message.message}
      TextInput.input(placeholder='Your message' multiline numberOfLines=3 onChangeText=onSetText value=text)
      Button.button(onClick=onSendMessage) #{'SEND'}
  `
}
export default observer(Chat)

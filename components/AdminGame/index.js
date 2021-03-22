import React, { useCallback, useEffect, useState } from 'react'
import { ImageBackground, TouchableOpacity } from 'react-native'
import { Icon, Alert, Div, Span, Row, Pagination, Select, Button, H3, Tag, Link, Avatar, Hr, TextInput, Multiselect } from '@startupjs/ui'
import { observer, useValue, useQuery, useLocal, useDoc, model } from '@startupjs/react-sharedb'
import { withRouter } from 'react-router'
import uuid from 'uuid'
import { faHandRock, faHandScissors, faHandPaper, faRunning } from '@fortawesome/free-solid-svg-icons'
import { BASE_URL } from '@env'

import { GAMES_COLLECTION, PLAYERS_COLLECTION, ROUNDS_COLLECTION, TEMPLATES_COLLECTION, CHAT_COLLECTION } from '../../const/default'

import './index.styl'

const AdminGame = ({ match: { params }, history }) => {
  const [skip, $skip] = useValue(0)
  const [userId] = useLocal('_session.userId')
  const [alertMessage, $alertMessage] = useValue('')

  // GAME DATA
  const [gameObj, $gameObj] = useDoc(GAMES_COLLECTION, params.id)

  // PLAYERS
  const query = { _id: { $in: gameObj.players } }
  const [players] = useQuery(PLAYERS_COLLECTION, query)

  // TEMPLATE
  const [template] = useDoc(TEMPLATES_COLLECTION, gameObj.templateId)

  const gameStarted = gameObj.startedAt > 0
  const gameGrouped = gameObj.groupedAt > 0
  const gameFinished = gameObj.finishedAt > 0

  if (!gameObj) {
    return pug`
      Span.gameStatus #{'GAME NOT FOUND'}
    `
  }

  const onFormGroups = async () => {
    if (gameObj.startedAt > 0) {
      $alertMessage.set('Game already started, cannot form groups')
      return
    }
    if (gameObj.players.length > 0) {
      const groups = []
      let templateData = {}
      console.debug('templateData', template)
      try {
        templateData = JSON.parse(template.template)
      } catch (e) {
        $alertMessage.set(`WRONG TEMPLATE, JSON ERROR ${e.message}`)
      }
      if (!templateData.rounds) return

      if (templateData.roles.length > gameObj.players.length) {
        $alertMessage.set(`You need at least ${templateData.roles.length} users to create a group`)
        return
      }

      const rolesCount = templateData.roles.length
      let group = {}
      let groupPlayers = []
      let roleIndex = 0
      gameObj.players.forEach(userId => {
        groupPlayers.push({ userId, role: templateData.roles[roleIndex] })
        roleIndex++
        console.debug('group.players.length', groupPlayers.length, rolesCount)
        if (groupPlayers.length === rolesCount) {
          group.players = [...groupPlayers]
          groups.push(group)
          groupPlayers = []
          group = {}
          roleIndex = 0
        }
      })
      if (groupPlayers.length > 0) {
        // rejoin rest users
        console.debug('drop users', groupPlayers)
        $gameObj.setEach({ players: gameObj.players.filter(p => !groupPlayers.find(item => item.userId === p)) })
      }

      // create chatrooms for groups
      const groupsWithChatIdAndRounds = await Promise.all(groups.map(async (g, groupIndex) => {
        const chatId = uuid()
        const $chat = model.scope(`${CHAT_COLLECTION}.${chatId}`)
        await $chat.create(g.players)

        const rounds = [...Array(templateData.rounds).keys()]
        const roundIds = await Promise.all(rounds.map(async (r) => {
          const roundId = uuid()
          const $round = model.scope(`${ROUNDS_COLLECTION}.${roundId}`)
          await $round.create(gameObj.id, groupIndex, g.players)
          return roundId
        }))
        return { ...g, chatId, rounds: roundIds }
      }))
      $gameObj.setEach({ groups: groupsWithChatIdAndRounds, groupedAt: Date.now() })
    } else {
      $alertMessage.set('No any users to grouping')
    }
  }

  const onStartGame = async () => {
    $gameObj.setEach({ startedAt: Date.now() })
  }

  return pug`
    Div.root
      Div.game
        if (alertMessage)
          Span.warning #{alertMessage}
        if (!gameObj)
          Span.gameStatus #{'GAME NOT FOUND'}
        else 
          if (gameFinished)
            Span.gameStatus #{'GAME FINISHED'}
          else
            if (!gameGrouped)
              Button(onClick=onFormGroups variant='flat') #{'Form groups'}
            else
              if (!gameStarted)
                Button(onClick=onStartGame variant='flat') #{'Start game'}
              else
                Span.gameStatus #{'GAME STARTED!'}
        Div.gameInfo
          Div.row
            Span.headcell #{'Game Name'}
            Span.cell #{gameObj.name}
          Div.row
            Span.headcell #{'Game Author'}
            Span.cell #{gameObj.creatorName}
          Div.row
            Span.headcell #{'Joined players'}
            Div.cell
              if (gameGrouped)
                each group, groupIndex in gameObj.groups
                  Div.row(key=groupIndex)
                    Div.cell
                      Span #{'Group #'} #{groupIndex+1}
                      each playerData, playerIndex in group.players
                        Div(key=playerData.userId)
                          - const player = players.find(p => p.id === playerData.userId)
                          Span #{playerIndex+1} #{player.firstName} #{player.lastName} (#{playerData.role})
              else
                each player in players
                  Div.row(key=player.id)
                    Span.cell #{player.firstName} #{player.lastName}
  `
}
export default withRouter(observer(AdminGame))

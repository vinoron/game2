import React, { useCallback, useEffect, useState } from 'react'
import { ImageBackground, TouchableOpacity } from 'react-native'
import { Icon, Alert, Div, Span, Row, Pagination, Select, Button, H3, Tag, Link, Avatar, Hr, TextInput, Multiselect } from '@startupjs/ui'
import { observer, useValue, useQuery, useLocal, useDoc, model } from '@startupjs/react-sharedb'
import { withRouter } from 'react-router'
import uuid from 'uuid'
import { faHandRock, faHandScissors, faHandPaper, faRunning } from '@fortawesome/free-solid-svg-icons'
import { BASE_URL } from '@env'

import { GAMES_COLLECTION, ROUNDS_COLLECTION, CHAT_COLLECTION } from '../../const/default'

import './index.styl'

const AdminGame = ({ match: { params }, history }) => {
  const [skip, $skip] = useValue(0)
  const [trigger, $trigger] = useValue({})
  const [userId] = useLocal('_session.userId')
  const [alertMessage, $alertMessage] = useValue('')

  const [game, $game] = useValue()
  const [players, $players] = useValue([])
  const [template, $template] = useValue({})
  const [roundId, $roundId] = useValue()
  const [loading, $loading] = useValue(false)

  useEffect(() => {
    $loading.set(true)
    const $obj = model.scope(`${GAMES_COLLECTION}.${params.id}`)
    console.debug(`${GAMES_COLLECTION}.${params.id}`)
    $obj.fetchGame().then(({ data, template, players, roundId }) => {
      $game.set(data)
      $players.set(players)
      $template.set(template)
      $roundId.set(roundId)
    }).catch(e => {
      console.debug('err', e)
    }).finally(() => {
      $loading.set(false)
    })
  }, [skip])

  const [gameObj, $gameObj] = useDoc(GAMES_COLLECTION, params.id)
  const [round, $round] = useDoc(ROUNDS_COLLECTION, roundId)
  const [currentRoundIndex, $currentRoundIndex] = useValue(game && (gameObj.rounds.length - 1))

  const gameStarted = gameObj.startedAt > 0
  const gameGrouped = gameObj.groupedAt > 0
  const gameFinished = gameObj.finishedAt > 0

//const $game = model.scope(`${GAMES_COLLECTION}.${gameId}`)
//await $game.finish()

  if (loading) {
    return pug`
      Div.gameStatus #{'LOADING...'}
    `
  }
  if (!game) {
    return pug`
      Div.gameStatus #{'GAME NOT FOUND'}
    `
  }

  const onFormGroups = async () => {
    if (game.startedAt > 0) {
      $alertMessage.set('Game already started, cannot form groups')
      return
    }
    if (game.players.length > 0) {
      const groups = []
      console.debug('templateData', template)
      const templateData = JSON.parse(template.template)

      if (templateData.roles.length > game.players.length) {
        $alertMessage.set(`You need at least ${templateData.roles.length} users to create a group`)
        return
      }

      const rolesCount = templateData.roles.length
      let group = {}
      let groupPlayers = []
      let roleIndex = 0
      game.players.forEach(userId => {
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
        $gameObj.setEach({ players: game.players.filter(p => !groupPlayers.find(item => item.userId === p)) })
      }

      // create chatrooms for groups
      const groupsWithChatId = await Promise.all(groups.map(async (g) => {
        const chatId = uuid()
        const $chat = model.scope(`${CHAT_COLLECTION}.${chatId}`)
        await $chat.create(g.players)
        return { ...g, chatId }
      }))

      $gameObj.setEach({ groups: groupsWithChatId, groupedAt: Date.now() })
      $trigger.set({})
    } else {
      $alertMessage.set('No any users to grouping')
    }
  }

  const onStartGame = () => {
    $gameObj.setEach({ startedAt: Date.now() })
    $trigger.set({})
  }

  const onNextRound = () => {
    $currentRoundIndex.set(currentRoundIndex + 1)
  }

  return pug`
    Div.root
      Div.game
        if (alertMessage)
          Span.warning #{alertMessage}
        if (!game)
          Div.gameStatus #{'GAME NOT FOUND'}
        else 
          if (gameFinished)
            Div.gameStatus #{'GAME FINISHED'}
          else
            if (!gameGrouped)
              Button(onClick=onFormGroups variant='flat') #{'Form groups'}
            else
              if (!gameStarted)
                Button(onClick=onStartGame variant='flat') #{'Start game'}
              else
                Div.gameStatus #{'GAME STARTED!'}
                Div.gameInfo
                  Div.row
                    Div.headcell #{'Round'}
                    Div.cell #{currentRoundIndex + 1}
                  if (round && round.finished)
                    Button.type(onClick=onNextRound) #{'NEXT'}
        Div.gameInfo
          Div.row
            Div.headcell #{'Game Name'}
            Div.cell #{game.name}
          Div.row
            Div.headcell #{'Game Author'}
            Div.cell #{game.creatorName}
          Div.row
            Div.headcell #{'Joined players'}
            Div.cell
              if (gameGrouped)
                each group, groupIndex in gameObj.groups
                  Div.row
                    Div.cell
                      Span #{'Group #'} #{groupIndex+1}
                      each playerData, playerIndex in group.players
                        Div
                          - const player = players.find(p => p.id === playerData.userId)
                          Span #{playerIndex+1} #{player.firstName} #{player.lastName} (#{playerData.role})
              else
                each player in players
                  Div.row
                    Span.cell #{player.firstName} #{player.lastName}
  `
}
export default withRouter(observer(AdminGame))

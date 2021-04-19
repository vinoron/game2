import React from 'react'
import { withRouter } from 'react-router'
import { observer, useValue, useQuery, useLocal, useDoc, model } from 'startupjs'
import { Div, Span, Button } from '@startupjs/ui'
import uuid from 'uuid'
import GameScores from '../GameScores'

import { GAMES_COLLECTION, PLAYERS_COLLECTION, ROUNDS_COLLECTION, TEMPLATES_COLLECTION, CHAT_COLLECTION } from '../../const/default'

import './index.styl'

const AdminGame = ({ match: { params }, history }) => {
  const [alertMessage, $alertMessage] = useValue('')

  // GAME DATA
  const [gameObj, $gameObj] = useDoc(GAMES_COLLECTION, params.id)

  // PLAYERS
  const query = { _id: { $in: gameObj.players } }
  const [players] = useQuery(PLAYERS_COLLECTION, query)

  // ROUNDS FULL DATA BY EVERY GROUP
  const roundIdsForAllGroups = gameObj.groups.reduce((acc, g) => [...acc, ...g.rounds], [])
  const queryRounds = { _id: { $in: roundIdsForAllGroups }, finished: true }
  const [roundsUnsortedFinished] = useQuery(ROUNDS_COLLECTION, queryRounds)
  const roundsByGroup = []
  // раунды разложенные по группам
  gameObj.groups.forEach((g, groupIndex) => {
    roundsByGroup.push([])
    g.rounds.forEach((roundId) => {
      const _round = roundsUnsortedFinished.find(r => r.id === roundId && r.finished)
      if (_round) {
        roundsByGroup[groupIndex].push(_round)
      }
    })
  })

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
        $gameObj.set('players', gameObj.players.filter(p => !groupPlayers.find(item => item.userId === p)))
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
    $gameObj.start()
  }

  const onFinishGame = async () => {
    $gameObj.finish()
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
                Button(onClick=onFinishGame variant='flat') #{'Finish game'}
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
                    Div.rounds
                      Div.finishMark(styleName=(roundsByGroup[groupIndex].length === group.rounds.length ? 'finished' : 'notFinished'))
                      GameScores(rounds=roundsByGroup[groupIndex], players=players)
              else
                each player in players
                  Div.row(key=player.id)
                    Span.cell #{player.firstName} #{player.lastName}
  `
}
export default withRouter(observer(AdminGame))

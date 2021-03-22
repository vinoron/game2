import React, { useCallback, useEffect, useState } from 'react'
import { ImageBackground, TouchableOpacity } from 'react-native'
import { Icon, Alert, Div, Span, Row, Pagination, Select, Button, H3, Tag, Avatar, Hr, TextInput, Multiselect } from '@startupjs/ui'
import { observer, useValue, useQuery, useLocal, useDoc, model } from '@startupjs/react-sharedb'
import { withRouter } from 'react-router'
import uuid from 'uuid'
import _ from 'lodash'
import { faHandRock, faHandScissors, faHandPaper, faRunning } from '@fortawesome/free-solid-svg-icons'
import { BASE_URL } from '@env'

import Chat from '../Chat'
import QuestionList from '../QuestionList'
import { GAMES_COLLECTION, PLAYERS_COLLECTION, TEMPLATES_COLLECTION, ROUNDS_COLLECTION, PAGE_LIMITS } from '../../const/default'

import './index.styl'

const Game = ({ match: { params }, history }) => {
  const [userId] = useLocal('_session.userId')
  const [alertMessage, $alertMessage] = useValue('')
  const [loading, $loading] = useValue(false)

  // GAME DATA
  const [gameObj, $gameObj] = useDoc(GAMES_COLLECTION, params.id)

  // PLAYERS
  const queryPlayers = { _id: { $in: gameObj.players } }
  const [players] = useQuery(PLAYERS_COLLECTION, queryPlayers)

  // GROUP
  const group = gameObj.groups.find(g => g.players.find(u => u.userId === userId)) || { players: [], rounds: [] }

  console.debug('group', group)

  const role = group.players.find(u => u.userId === userId)?.role

  // ROUNDS
  const queryRounds = { _id: { $in: group.rounds } }
  console.debug('queryRounds', queryRounds)
  const [roundsUnsorted] = useQuery(ROUNDS_COLLECTION, queryRounds)
  // текущий раунд
  let round = {}
  const rounds = []
  let finalFinishedRound = {}
  let roundIndex = 0
  group.rounds.some((roundId, index) => {
    const _round = roundsUnsorted.find(r => r.id === roundId)
    rounds.push(_round)
    if (_round) {
      if (!_round.finished) {
        round = _round
        roundIndex = index
        return true
      }
      if (index === group.rounds.length - 1 && _round.finished) {
        finalFinishedRound = _round
      }
    }
    return false
  })

  // TEMPLATE
  const [template] = useDoc(TEMPLATES_COLLECTION, gameObj.templateId)

  const gameStarted = gameObj.startedAt > 0
  const gameGrouped = gameObj.groupedAt > 0
  const gameFinished = !_.isEmpty(finalFinishedRound)
  const isJoined = gameObj && gameObj.players.includes(userId)

  if (loading) {
    return pug`
      Span.gameStatus #{'LOADING...'}
    `
  }
  if (!gameObj) {
    return pug`
      Span.gameStatus #{'GAME NOT FOUND'}
    `
  }

  if (gameStarted && !isJoined) {
    return pug`
      Span.gameStatus #{'GAME ALREADY STARTED, TRY ANOTHER'}
    `
  }

  // сущность раунда? сохранить все ответы на вопросы по ролям.
  // сохранить числовой результат по ролям
  // questionsData[0]['роль']

  const enemyId = gameObj && (gameObj.players[0] === userId ? gameObj.players[1] : gameObj.players[0])
  const youMoved = gameObj && round && round.movedPlayers && round.movedPlayers.includes(userId)

  const onJoin = () => {
    if (gameStarted) {
      $alertMessage.set('Game already started, select another game')
      return
    }
    if (gameObj.players.length === 0) {
      $gameObj.setEach({ players: [userId] })
      return
    }
    if (gameObj.players.length > 0) {
      $gameObj.setEach({ players: [...gameObj.players, userId] })
    }
  }

  const onSelect = (type) => async () => {
    // if (gameObj.finishedAt) return
    // if (!gameObj.rounds[currentRoundIndex]) {
    //   const newRoundId = uuid()
    //   $round.createByFirstMove(newRoundId, gameObj.id, userId, enemyId, type)
    //   // create new round
    //   $gameObj.setEach({
    //     rounds: [...gameObj.rounds, newRoundId]
    //   })
    // } else if (!round.finished) {
    //   // add to exists round and count scores
    //   const previousRoundId = currentRoundIndex > 0 && gameObj.rounds[currentRoundIndex - 1]
    //   await $round.setSecondMove(roundId, userId, enemyId, type, previousRoundId)
    // }
  }

  const onNextRound = () => {
    // $currentRoundIndex.set(currentRoundIndex + 1)
  }

  // const renderType = type => {
  //   const map = {
  //     O: pug` Icon(icon=faHandRock)`,
  //     V: pug` Icon(icon=faHandScissors)`,
  //     I: pug` Icon(icon=faHandPaper)`,
  //     C: pug` Icon(icon=faRunning)`
  //   }
  //   return map[type]
  // }

  const onAnswer = (answers) => {
    if (gameObj.finishedAt) return

    // groupId, template for roleindex etc.
    // работа с записью в раунд ответов и подсчет на последнем ответе по формуле (достав все сохраненные ответы и подготовив)
    console.debug('group', group)
    console.debug('round.id', round.id)
    console.debug('rounds', rounds)
    if (round && round.id) {
      const $round = model.scope(`${ROUNDS_COLLECTION}.${round.id}`)
      $round.saveToRound(round.id, template.template, userId, answers, rounds, roundIndex)
    }
  }

  const onCancel = () => {
    const $round = model.scope(`${ROUNDS_COLLECTION}.${round.id}`)
    $round.cancelSaveToRound(round.id, userId)
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
            Span.gameStatus #{'GROUP GAME FINISHED'}
          else
            if (gameGrouped && !isJoined)
              Span.gameStatus #{'GAME GROUPED. SORRY, YOU ARE NOT IN ANY GROUP'}
            else
              if (!gameStarted)
                if (isJoined)
                  if (!gameGrouped)
                    Span.gameStatus #{'You are joined. Waiting for group formation'}
                  else
                    Span.gameStatus #{'You are grouped. Waiting to start the game'}
                else
                  Button(onClick=onJoin variant='flat') #{'Join'}
              else
                Span.gameStatus #{'GAME STARTED!'}
                Div
                  Div.row
                    Span.headcell #{'Round'}
                    Span.cell #{roundIndex + 1}
                  if (round && round.finished)
                    Div.row
                      Span.headcell #{'Your move'}
                      // Span.cell #{renderType(round.players[userId].type)}
                    Div.row
                      Span.headcell #{'Your opponent move'}
                      // Span.cell #{renderType(round.players[enemyId].type)}
                    // Div.result
                    //   if (round.players[userId].score > round.players[enemyId].score)
                    //     Span.win #{'YOU WIN!'}
                    //   else if (round.players[userId].score < round.players[enemyId].score)
                    //     Span.lose #{'YOU LOSE!'}
                    //   else
                    //     Span.draw #{'DRAW!'}
                    //   Button.type(onClick=onNextRound) #{'NEXT'}
                  else
                    if youMoved
                      Div
                        Span.gameStatus #{'You are moved in this round. Waiting another player'}
                        Button.button(onClick=onCancel) #{'Cancel'}
                    else
                      Div.questions
                        QuestionList(onAnswer=onAnswer template=template)
                        // Button.type(onClick=onSelect('O') iconPosition='left') #{renderType('O')}
                        // Button.type(onClick=onSelect('V') iconPosition='left') #{renderType('V')}
                        // Button.type(onClick=onSelect('I') iconPosition='left') #{renderType('I')}
                        // Button.capitulate(onClick=onSelect('C') iconPosition='left') #{renderType('C')}
                Div.chat
                  Chat(id=group.chatId)
        Div.gameInfo
          Div.row
            Span.headcell #{'Game Name'}
            Span.cell #{gameObj.name}
          Div.row
            Span.headcell #{'Game Author'}
            Span.cell #{gameObj.creatorName}
          Div.row
            Span.headcell #{'Joined players'}
            Span.cell
              if (gameGrouped)
                Div.row
                Div.cell
                  Span #{isJoined ? 'YOUR GROUP' : 'YOU ARE KICKED FROM THIS GAME'} 
                  each playerData, playerIndex in group.players
                    Div(key=playerData.userId)
                      - const player = players.find(p => p.id === playerData.userId)
                      Span #{playerIndex+1} #{player.firstName} #{player.lastName} (#{playerData.role})
              else
                each player in players
                  Div.row(key=player.id)
                    Span.cell #{player.firstName} #{player.lastName}

          if (gameFinished)
            Div.row
              Span.headcell #{'Scores'}
              Div
                each r, rIndex in rounds
                  Div(key=r.id)
                    Span #{'Round #'}#{rIndex + 1}
                    Div.row3
                      Span.headcell #{'User'}
                      Span.headcell #{'Score'}
                      Span.headcell #{'ScoreAll'}
                    each p in r.players
                      Div.row3(key=p.userId)
                        - const playerData = players.find(pd => pd.id === p.userId)
                        Span.cell #{playerData.firstName} #{playerData.lastName}
                        Span.cell #{r.scores[p.userId].score}
                        Span.cell #{r.scores[p.userId].scoreAll}
  `
}
export default withRouter(observer(Game))

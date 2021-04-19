import React from 'react'
import { withRouter } from 'react-router'
import { observer, useValue, useQuery, useSession, useDoc, model } from 'startupjs'
import { Div, Span, Button } from '@startupjs/ui'

import _ from 'lodash'

import Chat from '../Chat'
import QuestionList from '../QuestionList'
import GameScores from '../GameScores'
import { GAMES_COLLECTION, PLAYERS_COLLECTION, TEMPLATES_COLLECTION, ROUNDS_COLLECTION, PAGE_LIMITS } from '../../const/default'

import './index.styl'

const Game = ({ match: { params }, history }) => {
  const [userId] = useSession('userId')
  const [alertMessage, $alertMessage] = useValue('')
  const [loading, $loading] = useValue(false)

  // GAME DATA
  const [gameObj, $gameObj] = useDoc(GAMES_COLLECTION, params.id)

  // PLAYERS
  const queryPlayers = { _id: { $in: gameObj.players } }
  const [players] = useQuery(PLAYERS_COLLECTION, queryPlayers)

  // GROUP
  const group = gameObj.groups.find(g => g.players.find(u => u.userId === userId)) || { players: [], rounds: [] }

  // ROUNDS
  const queryRounds = { _id: { $in: group.rounds } }

  // полные данные раундов
  const [roundsUnsorted] = useQuery(ROUNDS_COLLECTION, queryRounds)
  // текущий раунд
  let round = {}
  const rounds = []
  let finalFinishedRound = {}
  let roundIndex = 0
  // id раундов в правильном порядке
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

  const youMoved = gameObj && round && round.movedPlayers && round.movedPlayers.includes(userId)

  const onJoin = () => {
    if (gameStarted) {
      $alertMessage.set('Game already started, select another game')
      return
    }
    if (gameObj.players.length === 0) {
      $gameObj.set('players', [userId])
      return
    }
    if (gameObj.players.length > 0) {
      $gameObj.set('players', [...gameObj.players, userId])
    }
  }


  const onAnswer = (answers) => {
    if (gameObj.finishedAt) return
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
                    Div.row
                      Span.headcell #{'Your opponent move'}
                  else
                    if youMoved
                      Div
                        Span.gameStatus #{'You are moved in this round. Waiting another player'}
                        Button.button(onClick=onCancel) #{'Cancel'}
                    else
                      Div.questions
                        QuestionList(onAnswer=onAnswer template=template)
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
              GameScores(rounds=rounds, players=players)
  `
}
export default withRouter(observer(Game))

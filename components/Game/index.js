import React, { useCallback, useEffect, useState } from 'react'
import { ImageBackground, TouchableOpacity } from 'react-native'
import { Icon, Alert, Div, Span, Row, Pagination, Select, Button, H3, Tag, Link, Avatar, Hr, TextInput, Multiselect } from '@startupjs/ui'
import { observer, useValue, useQuery, useLocal, useDoc, model } from '@startupjs/react-sharedb'
import { withRouter } from 'react-router'
import uuid from 'uuid'
import { faHandRock, faHandScissors, faHandPaper, faRunning } from '@fortawesome/free-solid-svg-icons'
import { BASE_URL } from '@env'

import Chat from '../Chat'
import { GAMES_COLLECTION, ROUNDS_COLLECTION, PAGE_LIMITS } from '../../const/default'

import './index.styl'

const Game = ({ match: { params }, history }) => {
  const [skip, $skip] = useValue(0)
  const [trigger, $trigger] = useValue({})
  const [userId] = useLocal('_session.userId')
  const [alertMessage, $alertMessage] = useValue('')
  const [game, $game] = useValue()
  const [players, $players] = useValue([])
  const [roundId, $roundId] = useValue()
  const [loading, $loading] = useValue(false)

  useEffect(() => {
    $loading.set(true)
    const $obj = model.scope(`${GAMES_COLLECTION}.${params.id}`)
    $obj.fetchGame().then(({ data, players: p, roundId: r }) => {
      $game.set(data)
      console.debug('p', p)
      $players.set(p)
      $roundId.set(r)
    }).catch(e => {
      console.debug('err', e)
    }).finally(() => {
      $loading.set(false)
    })
  }, [skip, trigger])

  const [gameObj, $gameObj] = useDoc(GAMES_COLLECTION, params.id)
  const [round, $round] = useDoc(ROUNDS_COLLECTION, roundId)
  const [currentRoundIndex, $currentRoundIndex] = useValue(game && (gameObj.rounds.length - 1))

  const gameStarted = gameObj.startedAt > 0
  const gameGrouped = gameObj.groupedAt > 0
  const gameFinished = gameObj.finishedAt > 0
  const isJoined = game && game.players.includes(userId)

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

  if (gameStarted && !isJoined) {
    return pug`
      Div.gameStatus #{'GAME ALREADY STARTED, TRY ANOTHER'}
    `
  }

  const enemyId = game && (game.players[0] === userId ? game.players[1] : game.players[0])
  const yourMove = game && round && round.players && round.players[userId] && round.players[userId].type

  const onJoin = () => {
    if (gameStarted) {
      $alertMessage.set('Game already started, select another game')
      return
    }
    if (game.players.length === 0) {
      $gameObj.setEach({ players: [userId] })
      $trigger.set({})
      return
    }
    if (game.players.length > 0) {
      $gameObj.setEach({ players: [...game.players, userId] })
      $trigger.set({})
    }
  }

  const onSelect = (type) => async () => {
    if (game.finishedAt) return
    if (!game.rounds[currentRoundIndex]) {
      const newRoundId = uuid()
      $round.createByFirstMove(newRoundId, game.id, userId, enemyId, type)
      // create new round
      $gameObj.setEach({
        rounds: [...game.rounds, newRoundId]
      })
      $trigger.set({})
    } else if (!round.finished) {
      // add to exists round and count scores
      const previousRoundId = currentRoundIndex > 0 && game.rounds[currentRoundIndex - 1]
      await $round.setSecondMove(roundId, userId, enemyId, type, previousRoundId)
    }
  }

  const onNextRound = () => {
    $currentRoundIndex.set(currentRoundIndex + 1)
  }

  const renderType = type => {
    const map = {
      O: pug` Icon(icon=faHandRock)`,
      V: pug` Icon(icon=faHandScissors)`,
      I: pug` Icon(icon=faHandPaper)`,
      C: pug` Icon(icon=faRunning)`
    }
    return map[type]
  }

  const group = gameObj.groups.find(g => g.players.find(u => u.userId === userId)) || { players: [] }

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
            if (gameGrouped && !isJoined)
              Div.gameStatus #{'GAME GROUPED'}
            else
              if (!gameStarted)
                if (isJoined)
                  if (!gameGrouped)
                    Div.gameStatus #{'You are joined. Waiting for group formation'}
                  else
                    Div.gameStatus #{'You are grouped. Waiting to start the game'}
                else
                  Button(onClick=onJoin variant='flat') #{'Join'}
              else
                Div.gameStatus #{'GAME STARTED!'}
                Div.gameInfo
                  Div.row
                    Div.headcell #{'Round'}
                    Div.cell #{currentRoundIndex + 1}
                  if (round && round.finished)
                    Div.row
                      Div.headcell #{'Your move'}
                      Div.cell #{renderType(round.players[userId].type)}
                    Div.row
                      Div.headcell #{'Your opponent move'}
                      Div.cell #{renderType(round.players[enemyId].type)}
                    Div.result
                      if (round.players[userId].score > round.players[enemyId].score)
                        Div.win #{'YOU WIN!'}
                      else if (round.players[userId].score < round.players[enemyId].score)
                        Div.lose #{'YOU LOSE!'}
                      else
                        Div.draw #{'DRAW!'}
                      Button.type(onClick=onNextRound) #{'NEXT'}
                  else
                    if yourMove
                      Div
                        Span #{'Your choice'}
                        Span #{renderType(yourMove)}
                      Div.gameStatus #{'You are moved in this round. Waiting another player'}
                    else
                      Div.types
                        Button.type(onClick=onSelect('O') iconPosition='center') #{renderType('O')}
                        Button.type(onClick=onSelect('V') iconPosition='center') #{renderType('V')}
                        Button.type(onClick=onSelect('I') iconPosition='center') #{renderType('I')}
                        Button.capitulate(onClick=onSelect('C') iconPosition='center') #{renderType('C')}
                Div.chat
                  Chat(id=group.chatId)
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
                Div.row
                  Div.cell
                    Span #{'YOUR GROUP'} 
                    each playerData, playerIndex in group.players
                      Div
                        - const player = players.find(p => p.id === playerData.userId)
                        Span #{playerIndex+1} #{player.firstName} #{player.lastName} (#{playerData.role})
              else
                each player in players
                  Div.row
                    Span.cell #{player.firstName} #{player.lastName}

          if (round && round.finished)
            Div.row
              Div.headcell #{'Your score'}
              Div.cell #{round.players[userId].scoreAll || 0}
            Div.row
              Div.headcell #{'Your opponent score'}
              Div.cell #{round.players[enemyId].scoreAll || 0}
  `
}
export default withRouter(observer(Game))

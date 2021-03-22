import { BaseModel } from 'startupjs/orm'
import _ from 'lodash'

const calcEquation = (equation, answersSource, players, rounds, currentRoundIndex) => {
  // prepare template format data
  const answers = []
  players.forEach((p, playerIndex) => {
    answersSource[p.userId].forEach((a, answerIndex) => {
      if (!answers[answerIndex]) {
        answers[answerIndex] = {}
      }
      answers[answerIndex][p.role] = a
    })
  })
  let result = []
  try {
    eval(equation)
  } catch (err) {
    console.log('=====EQUATION EVAL ERROR=====')
    console.log(err.message)
  }
  return result
}
export default class RoundModel extends BaseModel {
  async create (gameId, groupIndex, players) {
    await this.createAsync({
      gameId,
      groupIndex,
      createdAt: Date.now(),
      finishedAt: null,
      finished: false,
      players,
      movedPlayers: [],
      answers: {},
      scores: {}
    })
  }

  async saveToRound (roundId, templateStr, userId, answers, rounds, currentRoundIndex) {
    const $round = this.scope(`${this.getCollection()}.${roundId}`)
    await this.fetchAsync($round)
    const round = $round.get()
    const movedPlayers = _.uniq([...round.movedPlayers, userId])
    const changedRoundValues = {
      answers: { ...round.answers, [userId]: answers },
      movedPlayers: movedPlayers
    }
    if (movedPlayers.length === round.players.length) {
      changedRoundValues.finished = true
      changedRoundValues.finishedAt = Date.now()
      try {
        const templateData = JSON.parse(templateStr)
        const result = calcEquation(templateData.equation, changedRoundValues.answers, round.players, rounds, currentRoundIndex)
        changedRoundValues.scores = {}
        result.forEach((res, resIndex) => {
          const userId = round.players[resIndex].userId
          console.debug('res userId', userId)
          const lastScoreAll = currentRoundIndex > 0 ? rounds[currentRoundIndex - 1].scores[userId].scoreAll : 0
          // todo add additional equation to calc scoreAll?
          changedRoundValues.scores[userId] = { score: res, scoreAll: lastScoreAll + res }
        })
      } catch (err) {
        console.log('=====EQUATION PARSE ERROR=====')
        console.log(err.message)
      }
    }
    console.debug('changedRoundValues', changedRoundValues)
    return $round.setEachAsync(changedRoundValues)
  }

  async cancelSaveToRound (roundId, userId) {
    const $round = this.scope(`${this.getCollection()}.${roundId}`)
    await this.fetchAsync($round)
    const round = $round.get()
    delete round.answers[userId]
    const movedPlayers = _.without(round.movedPlayers, userId)
    const changedRoundValues = {
      answers: round.answers,
      movedPlayers: movedPlayers
    }
    return $round.setEachAsync(changedRoundValues)
  }
}

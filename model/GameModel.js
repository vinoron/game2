import { BaseModel } from 'startupjs/orm'
import uuid from 'uuid'
import { ROUNDS_COLLECTION, PLAYERS_COLLECTION, TEMPLATES_COLLECTION } from '../const/default'

const ROUND_PAGE_LIMIT = 1

export default class GameModel extends BaseModel {
  async create (fields) {
    const id = uuid()
    const obj = this.scope(`${this.getCollection()}.${id}`)
    await obj.createAsync({
      ...fields,
      createdAt: Date.now(),
      groups: [],
      players: [],
      results: [],
      startedAt: null,
      finishedAt: null,
      groupedAt: null
    })
    const $template = this.scope(`${TEMPLATES_COLLECTION}.${fields.templateId}`)
    await $template.fetchAsync()
    const template = $template.get()
    await $template.setEach({ games: [...template.games, id] })
  }

  async start () {
    await this.setEach({ startedAt: Date.now() })
  }

  async fetchGame () {
    let data = this.get()
    if (!data) {
      await this.fetchAsync()
      data = this.get()
    }
    const $players = this.query(PLAYERS_COLLECTION, { _id: { $in: data.players } })
    await $players.fetchAsync()
    const players = $players.get()
    const $template = this.scope(`${TEMPLATES_COLLECTION}.${data.templateId}`)
    await $template.fetchAsync()
    const template = $template.get()

    const currentRoundIndex = data.rounds.length - 1
    const roundId = data.rounds[currentRoundIndex]
    return { data, players, template, roundId }
  }

  async fetchStat (skip = 0, userId = null) {
    let data = this.get()
    if (!data) {
      await this.fetchAsync()
      data = this.get()
    }
    const page = Math.floor(skip / ROUND_PAGE_LIMIT)

    let groupsToShow = data.groups

    if (userId) {
      groupsToShow = data.groups.filter(g => g.players.find(p => p.userId === userId))
    }

    const allRoundsIdSlicedByPage = groupsToShow.reduce((acc, g) => {
      return [...acc, ...g.rounds.slice(page * ROUND_PAGE_LIMIT, (page + 1) * ROUND_PAGE_LIMIT)]
    }, [])

    let allPlayersIdsToShow = groupsToShow.reduce((acc, g) => {
      return [...acc, ...g.players.map(p => p.userId)]
    }, [])

    const $players = this.query(PLAYERS_COLLECTION, { _id: { $in: allPlayersIdsToShow } })
    await $players.fetchAsync()
    const players = $players.get()

    const $rounds = this.query(ROUNDS_COLLECTION, { _id: { $in: allRoundsIdSlicedByPage }, $orderby: { finishedAt: 1 } })
    await $rounds.fetchAsync()
    const rounds = $rounds.get()
    const roundCount = data.groups[0].rounds.length
    return { rounds, groupsData: groupsToShow, roundCount, players, limit: ROUND_PAGE_LIMIT }
  }

  async finish () {
    let data = this.get()
    if (!data) {
      await this.fetchAsync()
      data = this.get()
    }
    await this.setEach({ finishedAt: Date.now() })
  }
}

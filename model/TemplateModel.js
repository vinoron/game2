import { BaseModel } from 'startupjs/orm'
import uuid from 'uuid'
import { GAMES_COLLECTION } from '../const/default'

const GAMES_PAGE_LIMIT = 10

export default class TemplateModel extends BaseModel {
  async create (fields) {
    const id = uuid()
    const obj = this.scope(`${this.getCollection()}.${id}`)
    await obj.createAsync({
      ...fields,
      createdAt: Date.now(),
      games: []
    })
  }

  async fetchGames (skip = 0) {
    let data = this.get()
    if (!data) {
      await this.fetchAsync()
      data = this.get()
    }
    const page = Math.floor(skip / GAMES_PAGE_LIMIT)
    const gamesIdSlicedByPage = data.games.slice(page * GAMES_PAGE_LIMIT, (page + 1) * GAMES_PAGE_LIMIT)
    const $games = this.query(GAMES_COLLECTION, { _id: { $in: gamesIdSlicedByPage }, $orderby: { startedAt: 1 } })
    await $games.fetchAsync()
    const games = $games.get()
    const gamesCount = data.games.length
    return { games, gamesCount, limit: GAMES_PAGE_LIMIT }
  }
}

import { BaseModel } from 'startupjs/orm'

export default class ChatModel extends BaseModel {
  async create (players) {
    await this.createAsync({
      players,
      messages: []
    })
  }
}

import Player from './PlayerModel'
import Game from './GameModel'
import Template from './TemplateModel'
import Round from './RoundModel'
import Chat from './ChatModel'
import { GAMES_COLLECTION, TEMPLATES_COLLECTION, PLAYERS_COLLECTION, ROUNDS_COLLECTION, CHAT_COLLECTION } from '../const/default'

export default function (racer) {
  racer.orm(`${PLAYERS_COLLECTION}.*`, Player)
  racer.orm(`${GAMES_COLLECTION}.*`, Game)
  racer.orm(`${TEMPLATES_COLLECTION}.*`, Template)
  racer.orm(`${ROUNDS_COLLECTION}.*`, Round)
  racer.orm(`${CHAT_COLLECTION}.*`, Chat)
}

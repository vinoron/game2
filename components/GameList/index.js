import React from 'react'
import { withRouter } from 'react-router'
import { observer, useValue, useQuery, useSession } from 'startupjs'
import { Div, Span, Row, Pagination, Select, Button } from '@startupjs/ui'
import moment from 'moment'

import StatList from 'components/StatList'
import { GAMES_COLLECTION, PAGE_LIMITS } from '../../const/default'

import './index.styl'

const GameList = ({ mode = 'user', active = true, history }) => {
  const [userId] = useSession('userId')
  let [skip, $skip] = useValue(0)
  let [limit, $limit] = useValue(PAGE_LIMITS[0])
  let [openedStatGameId, $openedStatGameId] = useValue(0)

  const query = {}

  if (!active) {
    query.finishedAt = { $gt: 0 }
  } else {
    query.finishedAt = null
  }

  switch (mode) {
    case 'user':
      // найти игры в которых не начата игра, или не закончена
      query.$or = [{ players: { $in: [userId] } }, { $where: 'this.startedAt === null' }]
      break
    case 'admin':
      // найти игры созданные пользователем
      query.adminId = userId
  }

  let [games] = useQuery(GAMES_COLLECTION, { ...query, $skip: skip, $limit: limit })
  let [count] = useQuery(GAMES_COLLECTION, { ...query, $count: 1 })
  const pages = Math.ceil(count / limit)

  const onChangePage = val => {
    $skip.set(val * limit)
  }

  const onSetLimit = val => {
    $skip.set(0)
    $limit.set(val)
  }

  const onJoin = gameId => () => {
    history.push(`/games/${gameId}`)
  }

  const onControl = gameId => () => {
    history.push(`/admin/games/${gameId}`)
  }

  const toggleStat = gameId => async () => {
    if (openedStatGameId === gameId) {
      $openedStatGameId.set(0)
    } else {
      $openedStatGameId.set(gameId)
    }
  }

  return pug`
    Div.root
      Row.pagination
        Pagination(pages=pages limit=limit $skip=$skip onChangePage=onChangePage)
        Select(
          value=limit
          showEmptyValue=false
          onChange=onSetLimit
          options=PAGE_LIMITS.map(l => ({ label: l, value: l }))
        )
      Row.deka
        Div.row
          Span.cell Name
          Span.cell Created At
          if (active)
            Span.cell Players
          if (!active)
            Span.cell Finished At
          Span.cell Creator Name
          if (mode === 'user')
            Div.gameJoin
        each game in games
          Div.row(key=game.id)
            Span.cell #{game.name}
            Span.cell #{moment(game.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
            if (active)
              Span.cell #{game.players.length}
            if (!active)
              Span.cell #{moment(game.finishedAt).format('MMMM Do YYYY, h:mm:ss a')}
            Span.cell #{game.creatorName}
            if (!active)
              Div.cell
                Button(onClick=(toggleStat(game.id))) #{openedStatGameId === game.id ? 'CLOSE' : 'OPEN'} #{'STAT'}
            else if (mode === 'user')
              Div.cell
                Button(onClick=(onJoin(game.id))) JOIN
            else if (mode === 'admin')
              Div.cell
                Button(onClick=(onControl(game.id))) CONTROL
          if (openedStatGameId === game.id)
            Div.stat
              StatList(gameId=openedStatGameId userId=(mode==='user' && userId))
  `
}
export default withRouter(observer(GameList))

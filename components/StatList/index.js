import React, { useEffect } from 'react'
import { withRouter } from 'react-router'
import { observer, useValue, model } from 'startupjs'
import { Div, Span, Row, Pagination } from '@startupjs/ui'
import GameScores from 'components/GameScores'
import { GAMES_COLLECTION } from '../../const/default'
import './index.styl'

const StatList = ({ gameId, userId = null }) => {
  let [skip, $skip] = useValue(0)
  let [pages, $skips] = useValue(0)
  let [limit, $limit] = useValue(0)
  let [groups, $groups] = useValue([])
  let [rounds, $rounds] = useValue([])
  let [players, $players] = useValue([])
  let [loading, $loading] = useValue(false)

  useEffect(() => {
    $loading.set(true)
    const $obj = model.scope(`${GAMES_COLLECTION}.${gameId}`)
    $obj.fetchStat(skip, userId).then(({ groupsData, rounds, players, roundCount, limit }) => {
      $groups.set(groupsData)
      $players.set(players)
      $rounds.set(rounds)
      $limit.set(limit)
      $skips.set(Math.ceil(roundCount / limit))
    }).finally(() => {
      $loading.set(false)
    })
  }, [skip])

  const onChangePage = val => {
    $skip.set(val * limit)
  }

  return pug`
    Div.root
      if (loading)
        Span #{'Loading...'}
      if (players.length)
        Div.results
          each group, groupIndex in groups
            if (!userId)
              Span #{'Group#'} #{groupIndex + 1}
            GameScores(key=group.id rounds=rounds.filter(r => group.rounds.includes(r.id)), roundNumberOffset=skip players=players)
        Row.pagination
          Pagination(pages=pages limit=limit $skip=$skip onChangePage=onChangePage)
  `
}
export default withRouter(observer(StatList))

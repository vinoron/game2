import React, { useEffect } from 'react'
import { withRouter } from 'react-router'
import { observer, useValue, model } from 'startupjs'
import { Div, Span, Row, Pagination } from '@startupjs/ui'
import { TEMPLATES_COLLECTION } from '../../const/default'

import './index.styl'

const GamesCardList = ({ templateId }) => {
  let [skip, $skip] = useValue(0)
  let [pages, $skips] = useValue(0)
  let [limit, $limit] = useValue(0)
  let [games, $games] = useValue([])
  let [loading, $loading] = useValue(false)

  useEffect(() => {
    $loading.set(true)
    const $obj = model.scope(`${TEMPLATES_COLLECTION}.${templateId}`)
    $obj.fetchGames(skip).then(({ games, gamesCount, limit }) => {
      $games.set(games)
      $limit.set(limit)
      $skips.set(Math.ceil(gamesCount / limit))
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
      else
        Row.pagination
          Pagination(pages=pages limit=limit $skip=$skip onChangePage=onChangePage)
        Div.deka
          Div.row
            Div.cell
              Span #{'#'}
            Div.cell
              Span #{'Name'}
            Div.cell
              Span #{'Description'}
          each game, index in games
            Div.row(key=game.id)
              Div.cell #{skip + index + 1}
              Div.cell
                Span #{game.name}
              Div.cell
                Span #{game.description}
  `
}
export default withRouter(observer(GamesCardList))

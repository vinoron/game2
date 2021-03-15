import React, { useCallback, useEffect, useState } from 'react'
import { ImageBackground, TouchableOpacity } from 'react-native'
import moment from 'moment'
import { Div, Span, Icon, Row, Pagination, Select, Button, H3, Tag, Link, Avatar, Hr, TextInput, Multiselect } from '@startupjs/ui'
import { observer, useValue, useQuery, useLocal, model } from '@startupjs/react-sharedb'
import { withRouter } from 'react-router'
import { faHandRock, faHandScissors, faHandPaper, faRunning } from '@fortawesome/free-solid-svg-icons'
import { BASE_URL } from '@env'

import { TEMPLATES_COLLECTION } from '../../const/default'

import './index.styl'

const GamesCardList = ({ templateId }) => {
  let [skip, $skip] = useValue(0)
  let [pages, $skips] = useValue(0)
  let [limit, $limit] = useValue(0)
  let [template, $template] = useValue({})
  let [games, $games] = useValue([])
  let [loading, $loading] = useValue(false)

  useEffect(() => {
    $loading.set(true)
    const $obj = model.scope(`${TEMPLATES_COLLECTION}.${templateId}`)
    $obj.fetchGames(skip).then(({ data, games, gamesCount, limit }) => {
      $template.set(data)
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
            Div.row
              Div.cell #{skip + index + 1}
              Div.cell
                Span #{game.name}
              Div.cell
                Span #{game.description}
  `
}
export default withRouter(observer(GamesCardList))

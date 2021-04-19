import React from 'react'
import { withRouter } from 'react-router'
import { observer, useValue, useQuery } from 'startupjs'
import { Div, Span, Row, Pagination, Select, Button } from '@startupjs/ui'
import GamesCardList from 'components/GamesCardList'
import { TEMPLATES_COLLECTION, PAGE_LIMITS } from '../../const/default'
import './index.styl'

const TemplateList = ({ history }) => {
  let [skip, $skip] = useValue(0)
  let [limit, $limit] = useValue(PAGE_LIMITS[0])
  let [openedTemplateId, $openedTemplateId] = useValue(0)

  const query = { $skip: skip, $limit: limit }

  let [templates] = useQuery(TEMPLATES_COLLECTION, query)

  let [count] = useQuery(TEMPLATES_COLLECTION, { $count: 1 })
  const pages = Math.ceil(count / limit)

  const goEdit = templateId => () => {
    history.push(`/admin/create-template/${templateId}`)
  }

  const onChangePage = val => {
    $skip.set(val * limit)
  }
  const onSetLimit = val => {
    $skip.set(0)
    $limit.set(val)
  }

  const onCreateGameByTemplate = templateId => () => {
    history.push(`/admin/create-game/${templateId}`)
  }

  const toggleTemplate = templateId => async () => {
    if (openedTemplateId === templateId) {
      $openedTemplateId.set(0)
    } else {
      $openedTemplateId.set(templateId)
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
          Div.cell Name
          Div.cell Description
          Div.cell
        each template in templates
          Div.row(key=template.id)
            Div.cell
              Span #{template.name}
              Button(onClick=(goEdit(template.id))) #{'EDIT TEMPLATE'}
            Div.cell
              Span #{template.description}
            Div.cell
              Button(onClick=(toggleTemplate(template.id))) #{openedTemplateId === template.id ? 'HIDE' : 'SHOW'} #{'GAMES'}
              Button(onClick=(onCreateGameByTemplate(template.id))) #{'CREATE GAME'}
          if (openedTemplateId === template.id)
            Div.stat
              GamesCardList(templateId=openedTemplateId)
  `
}
export default withRouter(observer(TemplateList))

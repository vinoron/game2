import React, { useCallback, useEffect, useState } from 'react'
import { Div, Span } from '@startupjs/ui'

import './index.styl'

const GameScores = ({ rounds, players, roundNumberOffset = 0 }) => {
  return pug`
    Div.root
      each r, rIndex in rounds
        Div(key=r.id)
          Span #{'Round #'}#{roundNumberOffset + rIndex + 1}
          Div.row3
            Span.headcell #{'User'}
            Span.headcell #{'Score'}
            Span.headcell #{'ScoreAll'}
          each p in r.players
            Div.row3(key=p.userId)
              - const playerData = players.find(pd => pd.id === p.userId)
              if (playerData)
                Span.cell #{playerData.firstName} #{playerData.lastName}
                Span.cell #{r.scores[p.userId].score}
                Span.cell #{r.scores[p.userId].scoreAll}
  `
}
export default GameScores

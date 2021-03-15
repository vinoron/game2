import PGame from './pages/PGame'
import PGames from './pages/PGames'
import PPastGames from './pages/PPastGames'
import PHighscores from './pages/PHighscores'

import getRoutes from './routes'

export { default as Layout } from './Layout'
export const routes = getRoutes({ PGames, PPastGames, PHighscores, PGame })

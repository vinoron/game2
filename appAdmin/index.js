import PAdminGames from './pages/PAdminGames'
import PAdminGame from './pages/PAdminGame'
import PCreateGame from './pages/PCreateGame'
import PPastAdminGames from './pages/PPastAdminGames'
import PTemplates from './pages/PTemplates'
import PCreateTemplate from './pages/PCreateTemplate'

import getRoutes from './routes'

export { default as Layout } from './Layout'
export const routes = getRoutes({ PCreateGame, PTemplates, PCreateTemplate, PPastAdminGames, PAdminGames, PAdminGame })

import { roles } from '@/config/config'
import { requireAuth } from '@/middleware/auth.middleware'
import { AuthorsPage } from '@/pages/authors/Authors'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/authors/')({
  loader: async () => {
    const authResult = await requireAuth(roles.authors)
    if (authResult.redirect) {
      throw redirect({ to: authResult.redirect })
    }
    return authResult.user
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <AuthorsPage />
}

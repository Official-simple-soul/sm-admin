import { roles } from '@/config/config'
import { requireAuth } from '@/middleware/auth.middleware'
import { CollectionsPage } from '@/pages/collections/Collections'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/collections/')({
  loader: async () => {
    const authResult = await requireAuth(roles.collections)
    if (authResult.redirect) {
      throw redirect({ to: authResult.redirect })
    }
    return authResult.user
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <CollectionsPage />
}

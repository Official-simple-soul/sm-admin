import { roles } from '@/config/config'
import { requireAuth } from '@/middleware/auth.middleware'
import { CategoriesPage } from '@/pages/categories/Categories'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/categories/')({
  loader: async () => {
    const authResult = await requireAuth(roles.categories)
    if (authResult.redirect) {
      throw redirect({ to: authResult.redirect })
    }
    return authResult.user
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <CategoriesPage />
}

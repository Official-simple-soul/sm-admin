import { roles } from '@/config/config'
import { requireAuth } from '@/middleware/auth.middleware'
import GalleryPage from '@/pages/gallery/Gallery'
import type { GalleryUploader } from '@/types/gallery.type'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/gallery/')({
  loader: async () => {
    const authResult = await requireAuth(roles.gallery)
    if (authResult.redirect) {
      throw redirect({ to: authResult.redirect })
    }
    return authResult.user
  },
  component: RouteComponent,
})

function RouteComponent() {
  const user = Route.useLoaderData()

  const uploader: GalleryUploader = {
    id: user!.id,
    name: user!.displayName || user!.name,
    avatar: user!.photoURL || undefined,
  }

  return <GalleryPage uploader={uploader} />
}

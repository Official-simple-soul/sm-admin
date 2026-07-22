import type { Timestamp } from 'firebase/firestore'

/** `gallery` is its own Firestore collection (separate from `posts`/`contents`)
 * — a loose visual showcase, not a fixed-shape card grid. Each image keeps
 * its real intrinsic `width`/`height` so the web gallery can lay tiles out
 * at their true aspect ratio (masonry) instead of forcing a uniform card
 * shape. Genre isn't stored here — it's derived from `relatedContentId` by
 * looking up that content item, so it never drifts out of sync. */
export interface GalleryUploader {
  id: string
  name: string
  avatar?: string
}

export interface GalleryImage {
  id: string
  imageUrl: string
  width: number
  height: number
  title?: string
  uploader: GalleryUploader
  relatedContentId?: string
  isApproved: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreateGalleryImageDTO = Omit<
  GalleryImage,
  'id' | 'createdAt' | 'updatedAt'
>

export type UpdateGalleryImageDTO = Partial<
  Omit<GalleryImage, 'id' | 'createdAt' | 'updatedAt'>
>

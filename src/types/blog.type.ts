import { Timestamp } from 'firebase/firestore'

/** Maps to the unified `posts` Firestore collection — this used to be a
 * separate admin-only `blogs` collection, merged into the same schema the
 * mobile app's community feed uses (see sm-comics/types/community.types.ts
 * Post). Keep field names in sync with that type. */
export interface BlogMedia {
  id: string
  type: 'image' | 'video'
  uri: string
  thumbnail?: string
  width?: number
  height?: number
}

export interface BlogAuthor {
  id: string
  name: string
  username?: string
  avatar: string
}

export interface Blog {
  id: string
  allowInteractions: boolean
  isApproved: boolean
  author: BlogAuthor
  content: string
  media: BlogMedia[]
  createdAt: Timestamp
  updatedAt: Timestamp
  likes: string[]
  totalComments: number
  shares: number
}

export interface CreateBlogDTO
  extends Omit<
    Blog,
    'id' | 'createdAt' | 'updatedAt' | 'totalComments' | 'likes' | 'shares'
  > {}

export interface UpdateBlogDTO
  extends Partial<Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>> {}

/** blogs' single `cover` image became a media array entry when the
 * collections merged — this is the one place that mapping lives, reused by
 * every place that used to just render `blog.cover`. */
export function getBlogCoverImage(blog: Pick<Blog, 'media'>): string {
  return blog.media?.find((item) => item.type === 'image')?.uri ?? ''
}

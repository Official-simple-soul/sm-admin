import { Timestamp } from 'firebase/firestore'

export interface ContentImages {
  thumbnail: string
  poster?: string
  backdrop: string
  card?: string
  square?: string
  portrait?: string
  gallery?: string[]
}

// export interface Content {
//   id?: string
//   author: string
//   collection: string
//   collectionId: string
//   collectionNum: number
//   genre: string[]
//   img: string
//   key?: string
//   num?: number
//   package: 'free' | 'premium'
//   pages: number
//   pdf?: string
//   video?: string
//   preview: string
//   rating: number
//   reviews: number
//   schedule: Timestamp | null
//   status: 'draft' | 'published'
//   tag: string
//   title: string
//   totalCompletions: number
//   totalReads: number
//   totalViews: number
//   categoryId: string
//   uploaded?: Timestamp
//   view: number
//   viewIds: string[]
// }

export interface CreateContentDTO
  extends Omit<
    Content,
    | 'totalCompletions'
    | 'totalReads'
    | 'totalViews'
    | 'view'
    | 'viewIds'
    | 'rating'
    | 'reviews'
  > {
  // These will be set to default values on creation
  totalCompletions?: number
  totalReads?: number
  totalViews?: number
  view?: number
  viewIds?: string[]
  rating?: number
  reviews?: number
  scheduledDate?: string
}

export interface Review {
  id: string
  image: string
  rating: number
  reviewText: string
  reviewer: string
}

export interface Content {
  id: string
  title: string
  description?: string
  collectionId: string
  collection: string
  collectionNum: number
  author?: string
  genre: string[]
  tagLine: string
  length: number
  key: string
  mode: 'reading' | 'watching'
  num: number
  synopsis: string
  thumbnail: string
  rating: number
  reviews: number
  totalRatings: number
  totalViews: number
  totalCompletions: number
  status: 'draft' | 'published' | 'archived'
  scheduledDate?: string
  package: 'free' | 'premium' | 'subscription'
  categoryId: string
  categoryName: string
  contentUrl: string
  uploadedAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp
  metadata?: Record<string, any>
  viewerIds: string[]
  authorIds: string[]
  authors?: Array<{
    id: string
    name: string
  }>
  images?: ContentImages
}

export interface Collection {
  id?: string
  author: string
  authorIds?: string[]
  count: number
  createdAt: Timestamp
  genre: string[]
  name: string
  type: string
  mode: 'reading' | 'watching'
}

export interface ContentProgress {
  id: string
  length: number
  position: number
  status: 'in_progress' | 'completed'
  completions?: number
  lastRead?: any
  content?: Content | null
  mode: 'reading' | 'watching'
}

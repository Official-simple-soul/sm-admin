import { Timestamp } from 'firebase/firestore'

export interface Collection {
  id?: string
  name: string
  author: string
  authorIds?: string[]
  authors?: Array<{
    id: string
    name: string
  }>
  genre: string[]
  count?: number
  mode: 'reading' | 'watching'
  createdAt?: Timestamp
}

import { Timestamp } from 'firebase/firestore'

export interface Author {
  id: string
  name: string
  slug: string
  normalizedName: string
  aliases: string[]
  contentCount: number
  status: 'active' | 'inactive'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreateAuthorDTO {
  name: string
  aliases?: string[]
  id?: string
}

export interface UpdateAuthorDTO extends Partial<CreateAuthorDTO> {
  name?: string
  aliases?: string[]
  status?: 'active' | 'inactive'
}

import { db } from '@/lib/firebase'
import type {
  Author,
  CreateAuthorDTO,
  UpdateAuthorDTO,
} from '@/types/author.type'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from 'firebase/firestore'

const tableName = 'authors'

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ')

const normalizeAuthorName = (value: string) =>
  normalizeWhitespace(value).toLowerCase().replace(/[-_]+/g, ' ')

const slugify = (value: string) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const shortHash = (value: string) =>
  Array.from(value)
    .reduce((hash, char) => {
      return (Math.imul(31, hash) + char.charCodeAt(0)) >>> 0
    }, 0)
    .toString(16)
    .slice(0, 8) || 'author'

const authorConverter = {
  toFirestore(author: Author): DocumentData {
    return {
      id: author.id,
      name: author.name,
      slug: author.slug,
      normalizedName: author.normalizedName,
      aliases: author.aliases,
      contentCount: author.contentCount,
      status: author.status,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    }
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): Author {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      name: data.name,
      slug: data.slug,
      normalizedName: data.normalizedName,
      aliases: data.aliases || [],
      contentCount: data.contentCount || 0,
      status: data.status || 'active',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  },
}

const getAuthorId = (name: string) => `${slugify(name)}-${shortHash(name)}`

export const authorApi = {
  async getAuthors(): Promise<Author[]> {
    const q = query(collection(db, tableName), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as Author)
  },

  async getAuthorById(id: string): Promise<Author | null> {
    const docSnap = await getDoc(doc(db, tableName, id).withConverter(authorConverter))
    return docSnap.exists() ? (docSnap.data() as Author) : null
  },

  async getAuthorByName(name: string): Promise<Author | null> {
    const normalizedName = normalizeAuthorName(name)
    const q = query(
      collection(db, tableName),
      where('normalizedName', '==', normalizedName),
      limit(1),
    )
    const querySnapshot = await getDocs(q)
    return (querySnapshot.docs[0]?.data() as Author) || null
  },

  async createAuthor(authorData: CreateAuthorDTO): Promise<Author> {
    const trimmedName = normalizeWhitespace(authorData.name)
    const normalizedName = normalizeAuthorName(trimmedName)
    const existing = await authorApi.getAuthorByName(trimmedName)

    if (existing) {
      return existing
    }

    const id = authorData.id || getAuthorId(trimmedName)
    const author: Author = {
      id,
      name: trimmedName,
      slug: slugify(trimmedName),
      normalizedName,
      aliases: (authorData.aliases || []).filter(Boolean),
      contentCount: 0,
      status: 'active',
      createdAt: serverTimestamp() as unknown as Author['createdAt'],
      updatedAt: serverTimestamp() as unknown as Author['updatedAt'],
    }

    await setDoc(doc(db, tableName, id), author)
    return author
  },

  async updateAuthor(id: string, authorData: UpdateAuthorDTO): Promise<void> {
    const docRef = doc(db, tableName, id)
    const payload: DocumentData = {
      ...authorData,
      updatedAt: serverTimestamp(),
    }

    if (authorData.name) {
      const trimmedName = normalizeWhitespace(authorData.name)
      payload.name = trimmedName
      payload.slug = slugify(trimmedName)
      payload.normalizedName = normalizeAuthorName(trimmedName)
    }

    await updateDoc(docRef, payload)
  },

  async deleteAuthor(id: string): Promise<void> {
    await deleteDoc(doc(db, tableName, id))
  },

  async incrementContentCount(id: string, amount = 1): Promise<void> {
    await updateDoc(doc(db, tableName, id), {
      contentCount: increment(amount),
      updatedAt: serverTimestamp(),
    })
  },

  async decrementContentCount(id: string, amount = 1): Promise<void> {
    await updateDoc(doc(db, tableName, id), {
      contentCount: increment(-amount),
      updatedAt: serverTimestamp(),
    })
  },
}

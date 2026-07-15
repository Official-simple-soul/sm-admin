import { db } from '@/lib/firebase'
import type { Collection } from '@/types/collection.type'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type SnapshotOptions,
} from 'firebase/firestore'

const collectionConverter = {
  toFirestore(collectionData: Collection): DocumentData {
    return {
      name: collectionData.name,
      author: collectionData.author,
      authorIds: collectionData.authorIds || [],
      authors: collectionData.authors || [],
      mode: collectionData.mode,
      genre: collectionData.genre,
      count: collectionData.count || 0,
      createdAt: collectionData.createdAt,
    }
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): Collection {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      name: data.name,
      author: data.author,
      authorIds: data.authorIds || [],
      authors: data.authors || [],
      mode: data.mode,
      genre: data.genre,
      count: data.count || 0,
      createdAt: data.createdAt,
    }
  },
}

// Collection service functions
export const collectionApi = {
  // Get all collections
  async getCollections(): Promise<Collection[]> {
    const q = query(
      collection(db, 'collections'),
      orderBy('createdAt', 'desc'),
    ).withConverter(collectionConverter)

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data())
  },

  // Get collections by type
  async getCollectionsByType(type: 'comic' | 'video'): Promise<Collection[]> {
    const q = query(
      collection(db, 'collections'),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
    ).withConverter(collectionConverter)

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data())
  },

  // Get collection by ID
  async getCollectionById(id: string): Promise<Collection | null> {
    const docRef = doc(db, 'collections', id).withConverter(collectionConverter)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data() : null
  },

  // Get collection by name
  async getCollectionByName(name: string): Promise<Collection | null> {
    const q = query(
      collection(db, 'collections'),
      where('name', '==', name),
    ).withConverter(collectionConverter)

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs[0]?.data() || null
  },

  // Create new collection
  async createCollection(
    collectionData: Omit<Collection, 'id'>,
  ): Promise<string> {
    const docRef = await addDoc(
      collection(db, 'collections').withConverter(collectionConverter),
      {
        ...collectionData,
        createdAt: serverTimestamp(),
      },
    )
    return docRef.id
  },

  // Update collection
  async updateCollection(
    id: string,
    collectionData: Partial<Collection>,
  ): Promise<void> {
    const docRef = doc(db, 'collections', id).withConverter(collectionConverter)
    await updateDoc(docRef, collectionData as DocumentData)
  },

  // Delete collection
  async deleteCollection(id: string): Promise<void> {
    await deleteDoc(doc(db, 'collections', id))
  },

  // Increment collection count
  async incrementCollectionCount(id: string): Promise<void> {
    const docRef = doc(db, 'collections', id)
    await updateDoc(docRef, {
      count: increment(1),
    })
  },

  // Decrement collection count
  async decrementCollectionCount(id: string): Promise<void> {
    const docRef = doc(db, 'collections', id)
    await updateDoc(docRef, {
      count: increment(-1),
    })
  },
}

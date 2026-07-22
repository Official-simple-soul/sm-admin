import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  GalleryImage,
  CreateGalleryImageDTO,
  UpdateGalleryImageDTO,
} from '@/types/gallery.type'

const galleryCollection = collection(db, 'gallery')

export const galleryApi = {
  getGalleryImages: async (): Promise<GalleryImage[]> => {
    const snapshot = await getDocs(
      query(galleryCollection, orderBy('createdAt', 'desc')),
    )
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<GalleryImage, 'id'>),
    }))
  },

  getGalleryImageById: async (id: string): Promise<GalleryImage | null> => {
    const docRef = doc(db, 'gallery', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...(docSnap.data() as Omit<GalleryImage, 'id'>) }
  },

  createGalleryImage: async (data: CreateGalleryImageDTO): Promise<string> => {
    const docRef = await addDoc(galleryCollection, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  },

  updateGalleryImage: async (
    id: string,
    data: UpdateGalleryImageDTO,
  ): Promise<void> => {
    const docRef = doc(db, 'gallery', id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  },

  deleteGalleryImage: async (id: string): Promise<void> => {
    const docRef = doc(db, 'gallery', id)
    await deleteDoc(docRef)
  },
}

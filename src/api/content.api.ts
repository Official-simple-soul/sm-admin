import { db, storage } from '@/lib/firebase'
import type {
  Content,
  ContentImages,
  CreateContentDTO,
  Review,
} from '@/types/content.type'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  deleteField,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type SnapshotOptions,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

const contentConverter = {
  toFirestore(content: Content): DocumentData {
    const images: ContentImages | undefined =
      content.images ??
      (content.thumbnail
        ? {
            thumbnail: content.thumbnail,
            poster: content.thumbnail,
            backdrop: content.thumbnail,
          }
        : undefined)

    return {
      authorIds: content.authorIds || [],
      collection: content.collection,
      collectionId: content.collectionId,
      collectionNum: content.collectionNum,
      categoryName: content.categoryName,
      categoryId: content.categoryId,
      genre: content.genre,
      thumbnail: content.thumbnail,
      images,
      key: content.key,
      num: content.num,
      mode: content.mode,
      package: content.package,
      length: content.length,
      contentUrl: content.contentUrl,
      synopsis: content.synopsis,
      rating: content.rating,
      reviews: content.reviews,
      scheduledDate: content.scheduledDate,
      status: content.status,
      tagLine: content.tagLine,
      title: content.title,
      totalCompletions: content.totalCompletions,
      totalRatings: content.totalRatings,
      totalViews: content.totalViews,
      uploadedAt: content.uploadedAt,
      updatedAt: content.updatedAt,
      viewerIds: content.viewerIds,
    }
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): Content {
    const data = snapshot.data(options)
    const legacyThumbnail = data.thumbnail ?? ''
    const images = data.images as ContentImages | undefined
    return {
      id: snapshot.id,
      author: data.author,
      authorIds: data.authorIds || [],
      authors: data.authors || [],
      collection: data.collection,
      collectionId: data.collectionId,
      collectionNum: data.collectionNum,
      categoryName: data.categoryName,
      categoryId: data.categoryId,
      genre: data.genre,
      thumbnail: images?.thumbnail ?? legacyThumbnail,
      images: images ?? (legacyThumbnail
        ? {
            thumbnail: legacyThumbnail,
            poster: legacyThumbnail,
            backdrop: legacyThumbnail,
          }
        : undefined),
      key: data.key,
      num: data.num,
      mode: data.mode,
      package: data.package,
      length: data.length,
      contentUrl: data.contentUrl,
      synopsis: data.synopsis,
      rating: data.rating,
      reviews: data.reviews,
      scheduledDate: data.scheduledDate,
      status: data.status,
      tagLine: data.tagLine,
      title: data.title,
      totalCompletions: data.totalCompletions,
      totalRatings: data.totalRatings,
      totalViews: data.totalViews,
      updatedAt: data.updatedAt,
      uploadedAt: data.uploadedAt,
      viewerIds: data.viewerIds,
    }
  },
}

const tableName = 'contents'

export const contentApi = {
  async getContent(): Promise<Content[]> {
    const q = query(
      collection(db, tableName).withConverter(contentConverter),
      orderBy('uploadedAt', 'desc'),
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as Content)
  },

  async getContentByType(categoryId: string): Promise<Content[]> {
    const q = query(
      collection(db, tableName).withConverter(contentConverter),
      where('categoryId', '==', categoryId),
      orderBy('uploadedAt', 'desc'),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as Content)
  },

  async getContentById(id: string): Promise<Content | null> {
    const docRef = doc(db, tableName, id).withConverter(contentConverter)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? (docSnap.data() as Content) : null
  },

  async createContent(contentData: CreateContentDTO): Promise<void> {
    const docRef = doc(db, tableName, contentData.id)
    await setDoc(docRef, contentData)
  },

  async updateContent(id: string, content: Partial<Content>): Promise<void> {
    const docRef = doc(db, tableName, id)
    await updateDoc(docRef, {
      ...(content as DocumentData),
      author: deleteField(),
      authors: deleteField(),
    })
  },

  async deleteContent(id: string): Promise<void> {
    await deleteDoc(doc(db, tableName, id))
  },

  async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    return await getDownloadURL(snapshot.ref)
  },

  async getReviews(
    contentId: string,
    limitCount: number = 3,
  ): Promise<Review[]> {
    const reviewsRef = collection(db, tableName, contentId, 'reviews')
    const q = query(reviewsRef, limit(limitCount))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[]
  },
}

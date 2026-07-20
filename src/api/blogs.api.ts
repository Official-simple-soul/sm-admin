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
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Blog, CreateBlogDTO, UpdateBlogDTO } from '@/types/blog.type'

// `posts` is the unified content collection shared with the mobile app's
// community feed (formerly a separate admin-only `blogs` collection, merged
// — see sm-comics/providers/CommunityProvider.tsx for the mobile-side
// read/write of the same collection).
const postCollection = collection(db, 'posts')
const postCommentCollection = collection(db, 'postComments')

async function deleteCommentsForPost(postId: string): Promise<void> {
  const commentsSnap = await getDocs(
    query(postCommentCollection, where('postId', '==', postId)),
  )

  await Promise.all(
    commentsSnap.docs.map(async (commentDoc) => {
      const repliesSnap = await getDocs(
        collection(db, 'postComments', commentDoc.id, 'replies'),
      )
      await Promise.all(repliesSnap.docs.map((replyDoc) => deleteDoc(replyDoc.ref)))
      await deleteDoc(commentDoc.ref)
    }),
  )
}

export const blogApi = {
  getBlogs: async (): Promise<Blog[]> => {
    const snapshot = await getDocs(query(postCollection))
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Blog, 'id'>),
    }))
  },

  getBlogById: async (id: string): Promise<Blog | null> => {
    const docRef = doc(db, 'posts', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...(docSnap.data() as Omit<Blog, 'id'>) }
  },

  createBlog: async (data: CreateBlogDTO): Promise<string> => {
    const docRef = await addDoc(postCollection, {
      ...data,
      totalComments: 0,
      likes: [],
      shares: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  },

  updateBlog: async (id: string, data: UpdateBlogDTO): Promise<void> => {
    const docRef = doc(db, 'posts', id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  },

  deleteBlog: async (id: string): Promise<void> => {
    await deleteCommentsForPost(id)
    const docRef = doc(db, 'posts', id)
    await deleteDoc(docRef)
  },
}

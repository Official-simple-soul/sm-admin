import { collectionApi } from '@/api/collection.api'
import type { Collection } from '@/types/collection.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useCollection = () => {
  const queryClient = useQueryClient()
  // Fetch all collections
  const {
    data: collections = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: collectionApi.getCollections,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: collectionApi.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })

  // Update collection mutation
  const updateCollectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Collection> }) =>
      collectionApi.updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })

  // Delete collection mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: collectionApi.deleteCollection,
  })

  // Get collections by type
  const getCollectionsByType = async (
    type: 'comic' | 'video',
  ): Promise<Collection[]> => {
    return collectionApi.getCollectionsByType(type)
  }

  // Get collection by ID
  const getCollectionById = async (id: string): Promise<Collection | null> => {
    return collectionApi.getCollectionById(id)
  }

  // Get collection by name
  const getCollectionByName = async (
    name: string,
  ): Promise<Collection | null> => {
    return collectionApi.getCollectionByName(name)
  }

  const incrementCollectionCount = useMutation({
    mutationFn: (id: string) => collectionApi.incrementCollectionCount(id),
    onSuccess: () => {
      // Invalidate collections so they refetch
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })

  const decrementCollectionCount = useMutation({
    mutationFn: (id: string) => collectionApi.decrementCollectionCount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
  })

  return {
    collections,
    isLoading,
    error,
    refetch,
    createCollection: createCollectionMutation.mutateAsync,
    updateCollection: updateCollectionMutation.mutateAsync,
    deleteCollection: deleteCollectionMutation.mutate,
    getCollectionsByType,
    getCollectionById,
    getCollectionByName,
    incrementCollectionCount: incrementCollectionCount.mutateAsync,
    decrementCollectionCount: decrementCollectionCount.mutateAsync,
    isCreating: createCollectionMutation.isPending,
    isUpdating: updateCollectionMutation.isPending,
    isDeleting: deleteCollectionMutation.isPending,
  }
}

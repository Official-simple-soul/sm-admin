import { authorApi } from '@/api/author.api'
import type { Author, CreateAuthorDTO, UpdateAuthorDTO } from '@/types/author.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useAuthor = () => {
  const queryClient = useQueryClient()

  const {
    data: authors = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Author[]>({
    queryKey: ['authors'],
    queryFn: authorApi.getAuthors,
    staleTime: 5 * 60 * 1000,
  })

  const createAuthorMutation = useMutation({
    mutationFn: (payload: CreateAuthorDTO) => authorApi.createAuthor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    },
  })

  const updateAuthorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuthorDTO }) =>
      authorApi.updateAuthor(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      queryClient.invalidateQueries({ queryKey: ['authors', id] })
    },
  })

  const incrementAuthorContentCountMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) =>
      authorApi.incrementContentCount(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    },
  })

  const decrementAuthorContentCountMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) =>
      authorApi.decrementContentCount(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    },
  })

  const getAuthorById = async (id: string): Promise<Author | null> => {
    return authorApi.getAuthorById(id)
  }

  const getAuthorByName = async (name: string): Promise<Author | null> => {
    return authorApi.getAuthorByName(name)
  }

  return {
    authors,
    isLoading,
    error,
    refetch,
    createAuthor: createAuthorMutation.mutateAsync,
    updateAuthor: updateAuthorMutation.mutateAsync,
    incrementAuthorContentCount:
      incrementAuthorContentCountMutation.mutateAsync,
    decrementAuthorContentCount:
      decrementAuthorContentCountMutation.mutateAsync,
    getAuthorById,
    getAuthorByName,
    isCreating: createAuthorMutation.isPending,
    isUpdating: updateAuthorMutation.isPending,
  }
}

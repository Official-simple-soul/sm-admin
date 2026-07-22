import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  GalleryImage,
  CreateGalleryImageDTO,
  UpdateGalleryImageDTO,
} from '@/types/gallery.type'
import { galleryApi } from '@/api/gallery.api'

export const useGalleryImages = () =>
  useQuery<GalleryImage[]>({
    queryKey: ['gallery'],
    queryFn: galleryApi.getGalleryImages,
  })

export const useCreateGalleryImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGalleryImageDTO) =>
      galleryApi.createGalleryImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
  })
}

export const useUpdateGalleryImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateGalleryImageDTO
    }) => galleryApi.updateGalleryImage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
  })
}

export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => galleryApi.deleteGalleryImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
  })
}

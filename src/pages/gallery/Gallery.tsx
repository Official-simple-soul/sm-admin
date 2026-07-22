import React, { useMemo, useState } from 'react'
import { Center, Text } from '@mantine/core'
import PageHeader from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import ActionModal from '@/components/modals/ActionModal'
import { CreateGalleryImageModal } from '@/components/modals/CreateGalleryImageModal'
import { colors } from '@/theme/theme'
import { useGalleryImages, useDeleteGalleryImage } from '@/services/gallery.service'
import { useContent } from '@/services/content.service'
import GalleryGrid from './components/GalleryGrid'
import { IconTrash } from '@tabler/icons-react'
import DashboardLayout from '@/layout/DashboardLayout'
import type { GalleryUploader } from '@/types/gallery.type'

interface GalleryPageProps {
  uploader: GalleryUploader
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ uploader }) => {
  const { data: images, error, isLoading } = useGalleryImages()
  const { content } = useContent()
  const { mutate: deleteGalleryImage, isPending: isDeleting } =
    useDeleteGalleryImage()
  const [imageIdToDelete, setImageIdToDelete] = useState<string | null>(null)
  const [uploadModalOpened, setUploadModalOpened] = useState(false)

  const contentTitleById = useMemo(
    () => Object.fromEntries(content.map((item) => [item.id, item.title])),
    [content],
  )

  const handleDelete = () => {
    if (!imageIdToDelete) return

    deleteGalleryImage(imageIdToDelete, {
      onSuccess: () => {
        setImageIdToDelete(null)
      },
    })
  }

  if (error) {
    return (
      <Center style={{ height: '50vh' }}>
        <Text c="red">Error loading gallery: {error.message}</Text>
      </Center>
    )
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Gallery"
        subtitle="A visual showcase of artwork, covers, and stills — independent of the content catalog"
        actionLabel="Add Image"
        onAction={() => setUploadModalOpened(true)}
      />

      {isLoading ? (
        <GalleryGrid isLoading />
      ) : images && images.length > 0 ? (
        <GalleryGrid
          images={images}
          contentTitleById={contentTitleById}
          onDelete={setImageIdToDelete}
        />
      ) : (
        <Center py="xl">
          <EmptyState
            title="No gallery images yet"
            description="Add the first image to start building the gallery"
          />
        </Center>
      )}

      <CreateGalleryImageModal
        opened={uploadModalOpened}
        onClose={() => setUploadModalOpened(false)}
        uploader={uploader}
      />

      <ActionModal
        opened={!!imageIdToDelete}
        onClose={() => setImageIdToDelete(null)}
        title={<span className="text-danger">Confirm Delete</span>}
        icon={
          <div className="bg-danger/10 p-2 rounded-full size-14 flex justify-center items-center">
            <IconTrash size={28} color={colors.danger} />
          </div>
        }
        message={
          <p className="text-info text-sm">
            Are you sure you want to delete this image? This action cannot be
            undone.
          </p>
        }
        primaryButtonText="Delete"
        onPrimaryButtonClick={() => {
          handleDelete()
        }}
        isPrimaryButtonLoading={isDeleting}
        primaryButtonColor={colors.danger}
        secondaryButtonText="Cancel"
        onSecondaryButtonClick={() => {
          setImageIdToDelete(null)
        }}
      />
    </DashboardLayout>
  )
}

export default GalleryPage

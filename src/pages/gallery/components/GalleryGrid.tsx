import React from 'react'
import { Card, Skeleton } from '@mantine/core'
import GalleryCard from './GalleryCard'
import type { GalleryImage } from '@/types/gallery.type'

interface GalleryGridProps {
  images?: GalleryImage[]
  isLoading?: boolean
  contentTitleById?: Record<string, string>
  onDelete?: (imageId: string) => void
}

const GalleryGrid: React.FC<GalleryGridProps> = ({
  images = [],
  isLoading = false,
  contentTitleById = {},
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} padding="lg" radius="md" withBorder>
            <Skeleton height={200} mb="md" />
            <Skeleton height={20} mb="xs" />
            <Skeleton height={16} width="70%" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <GalleryCard
          key={image.id}
          image={image}
          contentTitle={
            image.relatedContentId
              ? contentTitleById[image.relatedContentId]
              : undefined
          }
          onDelete={() => onDelete?.(image.id)}
        />
      ))}
    </div>
  )
}

export default GalleryGrid

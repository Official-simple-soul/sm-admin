import React from 'react'
import { ActionIcon, Badge, Card, Group, Image, Menu, Text } from '@mantine/core'
import { IconDotsVertical, IconTrash } from '@tabler/icons-react'
import { colors } from '@/theme/theme'
import type { GalleryImage } from '@/types/gallery.type'

interface GalleryCardProps {
  image: GalleryImage
  contentTitle?: string
  onDelete: () => void
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  image,
  contentTitle,
  onDelete,
}) => {
  return (
    <Card
      padding="xs"
      radius="lg"
      withBorder
      className="h-full bg-background/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
    >
      <Card.Section className="relative mb-3">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={image.imageUrl}
            h={200}
            alt={image.title || 'Gallery image'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fallbackSrc="https://placehold.co/600x400?text=Image"
          />
          <Badge
            variant="filled"
            color={colors.info}
            className="absolute top-2 right-2 shadow-md! shadow-black"
            radius="sm"
          >
            <p className="text-[10px]">
              {image.width}×{image.height}
            </p>
          </Badge>
        </div>
      </Card.Section>

      <div className="flex flex-col h-full">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div className="min-w-0">
            <Text fw={600} size="sm" lineClamp={1} className="text-text">
              {image.title || 'Untitled'}
            </Text>
            {contentTitle && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {contentTitle}
              </Text>
            )}
          </div>

          <Menu withinPortal position="bottom-end" shadow="sm">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg">
                <IconDotsVertical size={18} color={colors.primary} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                className="text-sm"
                onClick={onDelete}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Text size="xs" c="dimmed" mt="xs">
          By {image.uploader.name}
        </Text>
      </div>
    </Card>
  )
}

export default GalleryCard

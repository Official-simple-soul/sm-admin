import React from 'react'
import {
  Card,
  Image,
  Text,
  Badge,
  Group,
  Flex,
  Menu,
  ActionIcon,
} from '@mantine/core'
import {
  IconDotsVertical,
  IconEye,
  IconTrash,
  IconHeart,
  IconMessage,
  IconShare,
  IconCalendar,
} from '@tabler/icons-react'
import { colors } from '@/theme/theme'
import { getBlogCoverImage, type Blog } from '@/types/blog.type'
import { formatDate } from '@/utils/dateUtils'

interface BlogCardProps {
  blog: Blog
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, onView, onDelete }) => {
  return (
    <Card
      padding="xs"
      radius="lg"
      withBorder
      className="h-full bg-background/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
    >
      <Card.Section className="relative mb-4">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={getBlogCoverImage(blog) || 'https://placehold.co/600x400?text=Blog+Cover'}
            h={200}
            alt={blog.content.substring(0, 30) + '...'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fallbackSrc="https://placehold.co/600x400?text=Cover+Image"
          />
          <Badge
            color={blog.isApproved ? colors.success : colors.danger}
            variant="filled"
            className="absolute top-2 right-2 shadow-md! shadow-black"
            radius={'sm'}
          >
            <p className="text-[10px] capitalize">
              {blog.isApproved ? 'Approved' : 'Banned'}
            </p>
          </Badge>
        </div>
      </Card.Section>

      <div className="flex flex-col h-full">
        <div className="mb-2 flex items-center justify-between">
          <Text
            fw={700}
            size="md"
            lineClamp={1}
            className="text-text group-hover:text-primary transition-colors"
          >
            {blog.content.substring(0, 40) +
              (blog.content.length > 40 ? '...' : '')}
          </Text>
        </div>

        <Text size="xs" fw={400} className="mb-2 text-text" lineClamp={2}>
          By {blog.author.name}
          {blog.author.username ? ` (@${blog.author.username})` : ''}
        </Text>

        <div className="my-3">
          <Group justify="space-between" className="mb-1">
            <Group gap={4}>
              <IconHeart size={14} color={colors.danger} />
              <Text size="xs">{blog.likes?.length ?? 0}</Text>
            </Group>
            <Group gap={4}>
              <IconMessage size={14} color={colors.info} />
              <Text size="xs">{blog.totalComments}</Text>
            </Group>
            <Group gap={4}>
              <IconShare size={14} color={colors.success} />
              <Text size="xs">{blog.shares}</Text>
            </Group>
          </Group>
        </div>

        <div className="mt-auto">
          <Flex justify={'space-between'} align={'center'} className="mt-3">
            <Group gap={4}>
              <IconCalendar size={14} color={colors.info} />
              <Text size="xs">{formatDate(blog.createdAt.toDate())}</Text>
            </Group>
            <Menu withinPortal position="top-end" shadow="sm">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  className="hover:bg-gray-100"
                >
                  <IconDotsVertical size={18} color={colors.primary} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEye size={16} />}
                  className="text-sm"
                  onClick={onView}
                >
                  View Blog
                </Menu.Item>
                {/* <Menu.Item
                  leftSection={<IconEdit size={16} />}
                  className="text-sm"
                  onClick={onEdit}
                >
                  Edit Blog
                </Menu.Item>
                <Menu.Divider /> */}
                <Menu.Item
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  className="text-sm"
                  onClick={onDelete}
                >
                  Delete Blog
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        </div>
      </div>
    </Card>
  )
}

export default BlogCard

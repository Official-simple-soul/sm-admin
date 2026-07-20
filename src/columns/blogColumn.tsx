import type { ColumnDefinition } from '@/types/global.types'
import { getBlogCoverImage, type Blog } from '@/types/blog.type'
import { Badge, Box, Group, Image, Text } from '@mantine/core'
import {
  IconHeart,
  IconMessage,
  IconShare,
  IconCalendar,
} from '@tabler/icons-react'
import { TableMenu, TableText } from './Reuseable'
import { colors } from '@/theme/theme'
import { formatDate } from '@/utils/dateUtils'

export const blogColumns = (
  handleView: (blogId: string) => void,
  // handleEdit: (blogId: string) => void,
  handleDelete: (blogId: string) => void,
): ColumnDefinition<Blog>[] => {
  return [
    {
      accessor: 'content',
      header: 'Blog Content',
      width: 300,
      render: (row: Blog) => (
        <Group wrap="nowrap">
          <Image
            src={getBlogCoverImage(row) || 'https://placehold.co/40x40?text=Cover'}
            w={40}
            h={40}
            radius="sm"
            alt="Blog cover"
            fallbackSrc="https://placehold.co/40x40?text=Cover"
            className="flex-shrink-0"
          />
          <Box style={{ minWidth: 0 }}>
            <TableText className="truncate" lineClamp={1}>
              {row.content.substring(0, 60) +
                (row.content.length > 60 ? '...' : '')}
            </TableText>
            <Text size="xs" c="dimmed">
              By {row.author.name}
            </Text>
          </Box>
        </Group>
      ),
    },
    {
      accessor: 'status',
      header: 'Status',
      render: (row: Blog) => (
        <Badge
          variant="light"
          color={row.allowInteractions ? colors.success : colors.danger}
          size={'md'}
          styles={{
            root: {
              fontWeight: 500,
            },
          }}
        >
          {row.allowInteractions ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessor: 'engagement',
      header: 'Likes',
      render: (row: Blog) => (
        <Group gap={4}>
          <IconHeart size={16} color={colors.danger} />
          <TableText>{row.likes?.length ?? 0}</TableText>
        </Group>
      ),
    },
    {
      accessor: 'comments',
      header: 'Comments',
      render: (row: Blog) => (
        <Group gap={4}>
          <IconMessage size={16} color={colors.info} />
          <TableText>{row.totalComments}</TableText>
        </Group>
      ),
    },
    {
      accessor: 'shares',
      header: 'Shares',
      render: (row: Blog) => (
        <Group gap={4}>
          <IconShare size={16} color={colors.success} />
          <TableText>{row.shares}</TableText>
        </Group>
      ),
    },
    {
      accessor: 'date',
      header: 'Created At',
      render: (row: Blog) => (
        <Group gap={4}>
          <IconCalendar size={16} color={colors.info} />
          <TableText>{formatDate(row.createdAt.toDate())}</TableText>
        </Group>
      ),
    },
    {
      accessor: 'action',
      header: 'Action',
      align: 'center',
      render: (row: Blog) => (
        <TableMenu
          type="blog"
          onView={() => handleView(row.id)}
          // onEdit={() => handleEdit(row.id)}
          onDelete={() => handleDelete(row.id)}
          row={row}
        />
      ),
    },
  ]
}

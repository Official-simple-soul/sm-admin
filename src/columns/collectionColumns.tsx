import { colors } from '@/theme/theme'
import type { Collection } from '@/types/collection.type'
import type { ColumnDefinition } from '@/types/global.types'
import { Badge, Group } from '@mantine/core'
import { TableMenu, TableText } from './Reuseable'

const formatDate = (value: any) => {
  if (!value) return 'N/A'
  if (typeof value?.toDate === 'function') {
    return value.toDate().toLocaleDateString()
  }
  if (typeof value === 'string' || value instanceof Date) {
    return new Date(value).toLocaleDateString()
  }
  return 'N/A'
}

export const collectionColumns = (
  handleEdit: (row: Collection) => void,
): ColumnDefinition<Collection>[] => [
  {
    accessor: 'name',
    header: 'Collection',
    width: 260,
    render: (row) => (
      <Group gap="xs" wrap="nowrap">
        <div className="min-w-0">
          <TableText fw={600}>{row.name}</TableText>
          <TableText size="xs" c="dimmed">
            {row.author || 'No author'}
          </TableText>
        </div>
      </Group>
    ),
  },
  {
    accessor: 'mode',
    header: 'Type',
    render: (row) => (
      <Badge
        variant="light"
        color={row.mode === 'watching' ? 'grape' : colors.primary}
        styles={{ root: { textTransform: 'capitalize', fontWeight: 500 } }}
      >
        {row.mode === 'watching' ? 'Watching' : 'Flex'}
      </Badge>
    ),
  },
  {
    accessor: 'genre',
    header: 'Genres',
    render: (row) => (
      <TableText c="dimmed" className="normal-case">
        {row.genre?.length ? row.genre.join(', ') : 'N/A'}
      </TableText>
    ),
  },
  {
    accessor: 'count',
    header: 'Content Count',
    render: (row) => (
      <Badge variant="light" color={colors.primary}>
        {row.count || 0}
      </Badge>
    ),
  },
  {
    accessor: 'createdAt',
    header: 'Created',
    render: (row) => <TableText>{formatDate(row.createdAt)}</TableText>,
  },
  {
    accessor: 'actions',
    header: 'Actions',
    align: 'center',
    render: (row) => <TableMenu row={row} onEdit={handleEdit} type="collection" />,
  },
]

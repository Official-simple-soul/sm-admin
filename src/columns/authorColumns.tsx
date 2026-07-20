import { colors } from '@/theme/theme'
import type { Author } from '@/types/author.type'
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

export const authorColumns = (
  handleEdit: (row: Author) => void,
): ColumnDefinition<Author>[] => [
  {
    accessor: 'name',
    header: 'Author',
    width: 320,
    render: (row) => (
      <Group gap="xs" wrap="nowrap">
        <div className="min-w-0">
          <TableText fw={600}>{row.name}</TableText>
          <TableText size="xs" c="dimmed">
            {row.slug}
          </TableText>
        </div>
      </Group>
    ),
  },
  {
    accessor: 'contentCount',
    header: 'Content Count',
    render: (row) => (
      <Badge variant="light" color={colors.primary}>
        {row.contentCount || 0}
      </Badge>
    ),
  },
  {
    accessor: 'status',
    header: 'Status',
    render: (row) => (
      <Badge
        variant="light"
        color={row.status === 'active' ? 'green' : 'gray'}
        styles={{
          root: {
            textTransform: 'capitalize',
            fontWeight: 500,
          },
        }}
      >
        {row.status}
      </Badge>
    ),
  },
  {
    accessor: 'updatedAt',
    header: 'Updated',
    render: (row) => <TableText>{formatDate(row.updatedAt)}</TableText>,
  },
  {
    accessor: 'actions',
    header: 'Actions',
    align: 'center',
    render: (row) => (
      <TableMenu row={row} onEdit={handleEdit} type="author" />
    ),
  },
]

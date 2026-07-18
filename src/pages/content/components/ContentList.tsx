import { useState, useEffect } from 'react'
import { Group, Text, Menu, Select, Stack } from '@mantine/core'
import { IconFilter2, IconChevronDown, IconX } from '@tabler/icons-react'
import type { Content } from '@/types/content.type'
import TableComp from '@/components/Table'
import { contentColumns } from '@/columns/contentColumns'
import { AppButton } from '@/components/AppButton'
import { colors, radius } from '@/theme/theme'
import { sharedInputProps } from '@/constant/ui'

interface ContentListProps {
  content: Content[]
  isLoading?: boolean
  onEdit: (content: Content) => void
  onDelete: (content: Content) => void
  onView: (content: Content) => void
}

interface SearchParams {
  currentPage: number
  limit: number
  collection: string
  search: string
}

export const ContentList: React.FC<ContentListProps> = ({
  content,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
}) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    currentPage: 1,
    limit: 100,
    collection: '',
    search: '',
  })
  const [filterOpened, setFilterOpened] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  )

  const {
    currentPage,
    limit,
    collection: collectionFilter,
    search,
  } = searchParams

  const collections = Array.from(
    new Set(content.map((item) => item.collection).filter(Boolean)),
  ).map((collection) => ({
    value: collection,
    label: collection,
  }))

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({
      ...prev,
      currentPage: page,
    }))
  }

  const handlePerPageChange = (value: string) => {
    const newLimit = parseInt(value)
    setSearchParams((prev) => ({
      ...prev,
      limit: newLimit,
      currentPage: 1,
    }))
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchParams((prev) => ({
      ...prev,
      search: query,
      currentPage: 1,
    }))
  }

  const handleApplyFilter = () => {
    setSearchParams((prev) => ({
      ...prev,
      collection: selectedCollection || '',
      currentPage: 1,
    }))
    setFilterOpened(false)
  }

  // Clear all filters
  const handleClearFilter = () => {
    setSelectedCollection(null)
    setSearchParams((prev) => ({
      ...prev,
      collection: '',
      currentPage: 1,
    }))
    setFilterOpened(false)
  }

  const filteredContent = content.filter((item) => {
    if (collectionFilter && item.collection !== collectionFilter) {
      return false
    }

    if (search) {
      const searchQuery = search.toLowerCase()
      const matchesTitle = item.title.toLowerCase().includes(searchQuery)
      const matchesAuthor = item.author
        ? item.author.toLowerCase().includes(searchQuery)
        : false
      const matchesCollection = item.collection
        .toLowerCase()
        .includes(searchQuery)
      const matchesGenre = item.genre.some((genre) =>
        genre.toLowerCase().includes(searchQuery),
      )

      if (
        !matchesTitle &&
        !matchesAuthor &&
        !matchesCollection &&
        !matchesGenre
      ) {
        return false
      }
    }

    return true
  })

  const totalRecords = filteredContent.length
  const totalPages = Math.ceil(totalRecords / limit)
  const hasMorePages = currentPage < totalPages

  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit
  const currentPageData = filteredContent.slice(startIndex, endIndex)

  useEffect(() => {
    if (collectionFilter) {
      setSelectedCollection(collectionFilter)
    } else {
      setSelectedCollection(null)
    }
  }, [collectionFilter])

  return (
    <TableComp
      data={currentPageData}
      columns={contentColumns(onView, onEdit, onDelete)}
      totalRecords={totalRecords}
      recordsPerPage={limit}
      onPageChange={handlePageChange}
      currentPage={currentPage}
      isLoading={isLoading}
      tableTitle="Content Library"
      onSearch={handleSearch}
      showPagination={true}
      hasMorePages={hasMorePages}
      showFilter={true}
      onPerPageChange={handlePerPageChange}
      filterComponent={
        <Menu
          width={280}
          position="bottom-end"
          closeOnItemClick={false}
          opened={filterOpened}
        >
          <Menu.Target>
            <AppButton
              variant="default"
              fw={'normal'}
              onClick={() => setFilterOpened((o) => !o)}
              color="gray"
              style={{
                fontSize: '14px',
                color: 'gray',
                borderColor: '#EEEEEE',
              }}
              leftSection={<IconFilter2 size={16} />}
              rightSection={<IconChevronDown size={14} />}
            >
              Filter
            </AppButton>
          </Menu.Target>
          <Menu.Dropdown w={300} p={'md'} style={{ borderRadius: radius.app }}>
            <Stack gap="xs">
              <Text size={'md'} fw={500}>
                Filter Content
              </Text>

              <Text
                size={'sm'}
                c={colors.info}
                fw={400}
                style={{
                  borderTop: '1px solid #F1F3F9',
                  paddingTop: '10px',
                }}
              >
                Collection
              </Text>

              <Select
                placeholder="Select Collection"
                data={collections}
                value={selectedCollection}
                onChange={setSelectedCollection}
                searchable
                clearable
                nothingFoundMessage="No collections found"
                {...sharedInputProps()}
              />

              <Group grow mt="md">
                <AppButton
                  variant="default"
                  onClick={handleClearFilter}
                  disabled={!collectionFilter}
                  leftSection={<IconX size={16} color={colors.danger} />}
                >
                  Clear
                </AppButton>
                <AppButton onClick={handleApplyFilter}>Apply Filter</AppButton>
              </Group>
            </Stack>
          </Menu.Dropdown>
        </Menu>
      }
    />
  )
}

export default ContentList

// src/pages/blog/components/BlogList.tsx
import React, { useState, useEffect } from 'react'
import { Group, Text, Menu, Select, Stack } from '@mantine/core'
import { IconFilter2, IconChevronDown, IconX } from '@tabler/icons-react'
import TableComp from '@/components/Table'
import { blogColumns } from '@/columns/blogColumn'
import { AppButton } from '@/components/AppButton'
import { colors, radius } from '@/theme/theme'
import { sharedInputProps } from '@/constant/ui'
import type { Blog } from '@/types/blog.type'

interface BlogListProps {
  blogs: Blog[]
  isLoading?: boolean
  onView: (blogId: string) => void
  onEdit: (blogId: string) => void
  onDelete: (blogId: string) => void
}

interface SearchParams {
  currentPage: number
  limit: number
  status: string
  search: string
}

const BlogList: React.FC<BlogListProps> = ({
  blogs,
  isLoading = false,
  onView,
  // onEdit,
  onDelete,
}) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    currentPage: 1,
    limit: 10,
    status: '',
    search: '',
  })
  const [filterOpened, setFilterOpened] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const { currentPage, limit, status: statusFilter, search } = searchParams

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

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
      status: selectedStatus || '',
      currentPage: 1,
    }))
    setFilterOpened(false)
  }

  const handleClearFilter = () => {
    setSelectedStatus(null)
    setSearchParams((prev) => ({
      ...prev,
      status: '',
      currentPage: 1,
    }))
    setFilterOpened(false)
  }

  const filteredBlogs = blogs.filter((blog) => {
    if (statusFilter) {
      const isActive = blog.allowInteractions
      if (statusFilter === 'active' && !isActive) return false
      if (statusFilter === 'inactive' && isActive) return false
    }

    if (search) {
      const searchQuery = search.toLowerCase()
      const matchesContent = blog.content.toLowerCase().includes(searchQuery)
      const matchesAuthor =
        blog.author.name.toLowerCase().includes(searchQuery) ||
        (blog.author.username?.toLowerCase().includes(searchQuery) ?? false)

      if (!matchesContent && !matchesAuthor) {
        return false
      }
    }

    return true
  })

  const totalRecords = filteredBlogs.length
  const totalPages = Math.ceil(totalRecords / limit)
  const hasMorePages = currentPage < totalPages

  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit
  const currentPageData = filteredBlogs.slice(startIndex, endIndex)

  useEffect(() => {
    if (statusFilter) {
      setSelectedStatus(statusFilter)
    } else {
      setSelectedStatus(null)
    }
  }, [statusFilter])

  return (
    <TableComp
      data={currentPageData}
      columns={blogColumns(onView, onDelete)}
      totalRecords={totalRecords}
      recordsPerPage={limit}
      onPageChange={handlePageChange}
      currentPage={currentPage}
      isLoading={isLoading}
      tableTitle="Blog Posts"
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
                Filter Blogs
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
                Status
              </Text>

              <Select
                placeholder="Select Status"
                data={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
                nothingFoundMessage="No status found"
                {...sharedInputProps()}
              />

              <Group grow mt="md">
                <AppButton
                  variant="default"
                  onClick={handleClearFilter}
                  disabled={!statusFilter}
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

export default BlogList

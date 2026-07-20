import { authorColumns } from '@/columns/authorColumns'
import PageHeader from '@/components/PageHeader'
import TableComp from '@/components/Table'
import { CreateAuthorModal } from '@/components/modals/CreateAuthorModal'
import DashboardLayout from '@/layout/DashboardLayout'
import { useAuthor } from '@/services/author.service'
import type { Author } from '@/types/author.type'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { useMemo, useState } from 'react'

const PER_PAGE = 20

export function AuthorsPage() {
  const { authors, isLoading } = useAuthor()
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false)
  const [authorToEdit, setAuthorToEdit] = useState<Author | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredAuthors = useMemo(() => {
    if (!debouncedSearch.trim()) return authors
    const query = debouncedSearch.toLowerCase()
    return authors.filter((author) => author.name.toLowerCase().includes(query))
  }, [authors, debouncedSearch])

  const totalRecords = filteredAuthors.length
  const startIndex = (currentPage - 1) * PER_PAGE
  const currentPageData = filteredAuthors.slice(startIndex, startIndex + PER_PAGE)

  const handleEdit = (author: Author) => {
    setAuthorToEdit(author)
    openModal()
  }

  const handleAddNew = () => {
    setAuthorToEdit(null)
    openModal()
  }

  const handleSearch = (query: string) => {
    setSearch(query)
    setCurrentPage(1)
  }

  const handleModalClose = () => {
    closeModal()
    setAuthorToEdit(null)
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Authors"
        subtitle="Manage the authors and creators behind your content"
        actionLabel="Add Author"
        onAction={handleAddNew}
      />

      <TableComp
        data={currentPageData}
        columns={authorColumns(handleEdit)}
        totalRecords={totalRecords}
        recordsPerPage={PER_PAGE}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
        isLoading={isLoading}
        tableTitle="Authors"
        onSearch={handleSearch}
        showFilter={false}
        showPagination={totalRecords > PER_PAGE}
        searchPlaceholder="Search authors..."
        noDataMessage="No authors found."
      />

      <CreateAuthorModal
        opened={modalOpened}
        onClose={handleModalClose}
        authorToEdit={authorToEdit}
      />
    </DashboardLayout>
  )
}

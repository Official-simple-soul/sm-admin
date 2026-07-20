import { collectionColumns } from '@/columns/collectionColumns'
import PageHeader from '@/components/PageHeader'
import TableComp from '@/components/Table'
import { CreateCollectionModal } from '@/components/modals/CreateCollectionModal'
import DashboardLayout from '@/layout/DashboardLayout'
import { useCollection } from '@/services/collection.service'
import type { Collection } from '@/types/collection.type'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { useMemo, useState } from 'react'

const PER_PAGE = 20

export function CollectionsPage() {
  const { collections, isLoading } = useCollection()
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false)
  const [collectionToEdit, setCollectionToEdit] = useState<Collection | null>(
    null,
  )
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredCollections = useMemo(() => {
    if (!debouncedSearch.trim()) return collections
    const query = debouncedSearch.toLowerCase()
    return collections.filter(
      (collection) =>
        collection.name.toLowerCase().includes(query) ||
        collection.author?.toLowerCase().includes(query),
    )
  }, [collections, debouncedSearch])

  const totalRecords = filteredCollections.length
  const startIndex = (currentPage - 1) * PER_PAGE
  const currentPageData = filteredCollections.slice(
    startIndex,
    startIndex + PER_PAGE,
  )

  const handleEdit = (collection: Collection) => {
    setCollectionToEdit(collection)
    openModal()
  }

  const handleAddNew = () => {
    setCollectionToEdit(null)
    openModal()
  }

  const handleSearch = (query: string) => {
    setSearch(query)
    setCurrentPage(1)
  }

  const handleModalClose = () => {
    closeModal()
    setCollectionToEdit(null)
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Collections"
        subtitle="Manage the series and collections your content belongs to"
        actionLabel="Add Collection"
        onAction={handleAddNew}
      />

      <TableComp
        data={currentPageData}
        columns={collectionColumns(handleEdit)}
        totalRecords={totalRecords}
        recordsPerPage={PER_PAGE}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
        isLoading={isLoading}
        tableTitle="Collections"
        onSearch={handleSearch}
        showFilter={false}
        showPagination={totalRecords > PER_PAGE}
        searchPlaceholder="Search collections..."
        noDataMessage="No collections found."
      />

      <CreateCollectionModal
        opened={modalOpened}
        onClose={handleModalClose}
        collectionToEdit={collectionToEdit}
      />
    </DashboardLayout>
  )
}

import { categoryColumns } from '@/columns/categoryColumns'
import PageHeader from '@/components/PageHeader'
import TableComp from '@/components/Table'
import { CreateCategoryModal } from '@/components/modals/CreateCategoryModal'
import DashboardLayout from '@/layout/DashboardLayout'
import { useCategory } from '@/services/category.service'
import type { Category } from '@/types/category.type'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { useMemo, useState } from 'react'

const PER_PAGE = 20

export function CategoriesPage() {
  const { categories, isLoading } = useCategory()
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return categories
    const query = debouncedSearch.toLowerCase()
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    )
  }, [categories, debouncedSearch])

  const totalRecords = filteredCategories.length
  const startIndex = (currentPage - 1) * PER_PAGE
  const currentPageData = filteredCategories.slice(
    startIndex,
    startIndex + PER_PAGE,
  )

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category)
    openModal()
  }

  const handleAddNew = () => {
    setCategoryToEdit(null)
    openModal()
  }

  const handleSearch = (query: string) => {
    setSearch(query)
    setCurrentPage(1)
  }

  const handleModalClose = () => {
    closeModal()
    setCategoryToEdit(null)
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Categories"
        subtitle="Manage the categories content is organized under"
        actionLabel="Add Category"
        onAction={handleAddNew}
      />

      <TableComp
        data={currentPageData}
        columns={categoryColumns(handleEdit)}
        totalRecords={totalRecords}
        recordsPerPage={PER_PAGE}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
        isLoading={isLoading}
        tableTitle="Categories"
        onSearch={handleSearch}
        showFilter={false}
        showPagination={totalRecords > PER_PAGE}
        searchPlaceholder="Search categories..."
        noDataMessage="No categories found."
      />

      <CreateCategoryModal
        opened={modalOpened}
        onClose={handleModalClose}
        categoryToEdit={categoryToEdit}
      />
    </DashboardLayout>
  )
}

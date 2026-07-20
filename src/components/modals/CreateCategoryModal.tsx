import { CATEGORY_ICONS, CONTENT_MODES } from '@/constant/constant'
import { modalBaseProps, sharedInputProps } from '@/constant/ui'
import { useCategory } from '@/services/category.service'
import { colors } from '@/theme/theme'
import type { Category } from '@/types/category.type'
import { Box, Group, Modal, Select, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconCategoryPlus } from '@tabler/icons-react'
import { useEffect } from 'react'
import { AppButton } from '../AppButton'

interface CreateCategoryModalProps {
  opened: boolean
  onClose: () => void
  categoryToEdit?: Category | null
  onCreated?: () => void
  onUpdated?: () => void
}

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ')

const slugify = (value: string) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function CreateCategoryModal({
  opened,
  onClose,
  categoryToEdit,
  onCreated,
  onUpdated,
}: CreateCategoryModalProps) {
  const { createCategory, updateCategory, isCreating, isUpdating, getCategoryByName } =
    useCategory()
  const isEditMode = !!categoryToEdit

  const form = useForm({
    initialValues: {
      name: '',
      icon: 'book',
      mode: 'reading' as 'reading' | 'watching',
    },
    validate: {
      name: (value) => (value.trim() ? null : 'Category name is required'),
      mode: (value) => (value ? null : 'Content type is required'),
    },
  })

  useEffect(() => {
    if (!opened) {
      form.reset()
      return
    }

    if (categoryToEdit) {
      form.setValues({
        name: categoryToEdit.name,
        icon: categoryToEdit.icon,
        mode: categoryToEdit.mode,
      })
    }
  }, [categoryToEdit, opened])

  const handleSubmit = async (values: typeof form.values) => {
    const trimmedName = normalizeWhitespace(values.name)

    try {
      if (isEditMode && categoryToEdit) {
        const existing = await getCategoryByName(trimmedName)
        if (existing && existing.id !== categoryToEdit.id) {
          notifications.show({
            title: 'Category exists',
            message: `${existing.name} already exists and cannot be duplicated.`,
            color: 'red',
          })
          return
        }

        await updateCategory({
          id: categoryToEdit.id,
          data: { name: trimmedName, icon: values.icon, mode: values.mode },
        })

        onUpdated?.()
      } else {
        const existing = await getCategoryByName(trimmedName)
        if (existing) {
          notifications.show({
            title: 'Category exists',
            message: `${existing.name} already exists and cannot be duplicated.`,
            color: 'red',
          })
          return
        }

        const id = slugify(trimmedName)
        await createCategory({ id, name: trimmedName, icon: values.icon, mode: values.mode })
        onCreated?.()
      }

      notifications.show({
        title: 'Success',
        message: `Category ${isEditMode ? 'updated' : 'created'} successfully`,
        color: colors.primary,
      })
      form.reset()
      onClose()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEditMode ? 'update' : 'create'} category: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        color: colors.danger,
      })
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconCategoryPlus size={20} />
          <Text fw={600}>{isEditMode ? 'Edit Category' : 'Create New Category'}</Text>
        </Group>
      }
      centered
      {...modalBaseProps()}
    >
      <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Category Name"
            placeholder="Enter category name"
            required
            {...form.getInputProps('name')}
            {...sharedInputProps()}
            description="e.g., Anime, Manga, Documentary, Series"
          />

          <Select
            label="Category Icon"
            placeholder="Select an icon"
            data={CATEGORY_ICONS}
            {...form.getInputProps('icon')}
            {...sharedInputProps()}
            description="Choose an icon that represents this category"
          />

          <Select
            label="Content Type"
            placeholder="Select type"
            required
            data={CONTENT_MODES}
            {...form.getInputProps('mode')}
            {...sharedInputProps()}
          />

          <Group justify="flex-end" mt="md">
            <AppButton
              variant="default"
              onClick={onClose}
              loading={isLoading}
              disabled={isLoading}
            >
              Cancel
            </AppButton>
            <AppButton type="submit" loading={isLoading} disabled={isLoading}>
              {isEditMode ? 'Update Category' : 'Create Category'}
            </AppButton>
          </Group>
        </Stack>
      </Box>
    </Modal>
  )
}

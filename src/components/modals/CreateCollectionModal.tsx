import { CreateAuthorModal } from '@/components/modals/CreateAuthorModal'
import { modalBaseProps, sharedInputProps } from '@/constant/ui'
import { useAuthor } from '@/services/author.service'
import { useCollection } from '@/services/collection.service'
import { colors } from '@/theme/theme'
import type { Author } from '@/types/author.type'
import type { Collection } from '@/types/collection.type'
import {
  Box,
  Anchor,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useEffect, useMemo, useState } from 'react'
import { AppButton } from '../AppButton'

interface CreateCollectionModalProps {
  opened: boolean
  onClose: () => void
  collectionToEdit?: Collection
}

const genres = [
  'action',
  'adventure',
  'comedy',
  'drama',
  'fantasy',
  'horror',
  'mystery',
  'romance',
  'sci-fi',
  'superhero',
  'thriller',
  'super-hero',
]

const contentTypes = [
  { value: 'reading', label: 'Flex' },
  { value: 'watching', label: 'Watching' },
]

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ')

const normalizeAuthorKey = (value: string) =>
  normalizeWhitespace(value).toLowerCase().replace(/[-_]+/g, ' ')

const resolveAuthorIdsFromText = (
  rawValue: string,
  authorOptions: Array<{ id: string; name: string }>,
) => {
  const names = rawValue
    .split(/,|\s+and\s+/i)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)
  const byKey = new Map(
    authorOptions.map((author) => [normalizeAuthorKey(author.name), author.id]),
  )

  return Array.from(
    new Set(
      names
        .map((name) => byKey.get(normalizeAuthorKey(name)))
        .filter((id): id is string => Boolean(id)),
    ),
  )
}

export function CreateCollectionModal({
  opened,
  onClose,
  collectionToEdit,
}: CreateCollectionModalProps) {
  const { createCollection, isCreating } = useCollection()
  const { authors } = useAuthor()
  const [openNewAuthorModal, setOpenNewAuthorModal] = useState(false)
  const form = useForm({
    initialValues: {
      name: '',
      authorIds: [] as string[],
      mode: 'reading' as 'reading' | 'watching',
      genre: [] as string[],
    },

    validate: {
      name: (value) => (value.trim() ? null : 'Collection name is required'),
      authorIds: (value) =>
        value.length > 0 ? null : 'At least one author is required',
      mode: (value) => (value ? null : 'Content type is required'),
      genre: (value) =>
        value.length > 0 ? null : 'At least one genre is required',
    },
  })

  const authorOptions = useMemo(
    () =>
      authors.map((author) => ({
        value: author.id,
        label: author.name,
      })),
    [authors],
  )

  useEffect(() => {
    if (collectionToEdit) {
      const existingAuthorIds = Array.isArray(collectionToEdit.authorIds)
        ? collectionToEdit.authorIds
        : Array.isArray(collectionToEdit.authors)
          ? collectionToEdit.authors.map((author) => author.id)
          : collectionToEdit.author
          ? resolveAuthorIdsFromText(collectionToEdit.author, authors)
          : []
      form.setValues({
        name: collectionToEdit.name,
        authorIds: existingAuthorIds,
        mode: collectionToEdit.mode,
        genre: collectionToEdit.genre,
      })
    } else {
      form.reset()
    }
  }, [collectionToEdit, opened, authors])

  const handleAuthorCreated = (author: Author) => {
    form.setValues({
      ...form.values,
      authorIds: Array.from(new Set([...form.values.authorIds, author.id])),
    })
  }

  const handleSubmit = async (values: typeof form.values) => {
    const selectedAuthorDocs = authors.filter((author) =>
      values.authorIds.includes(author.id),
    )
    const authorNameText = selectedAuthorDocs
      .map((author) => author.name)
      .join(', ')
    const authorPayload = selectedAuthorDocs.map((author) => ({
      id: author.id,
      name: author.name,
    }))

    try {
      await createCollection({
        name: values.name,
        author: authorNameText,
        authorIds: values.authorIds,
        authors: authorPayload,
        mode: values.mode,
        genre: values.genre,
      })

      notifications.show({
        title: 'Success',
        message: `Collection ${collectionToEdit ? 'updated' : 'created'} successfully`,
        color: colors.primary,
      })
      form.reset()
      onClose()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${collectionToEdit ? 'update' : 'create'} collection: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        color: colors.danger,
      })
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={collectionToEdit ? 'Edit Collection' : 'Create New Collection'}
      centered
      {...modalBaseProps()}
    >
      <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Collection Name"
            placeholder="Enter collection name"
            required
            {...form.getInputProps('name')}
            {...sharedInputProps()}
          />

          <MultiSelect
            label="Collection Authors"
            placeholder="Select authors"
            required
            data={authorOptions}
            searchable
            nothingFoundMessage="No authors found"
            {...form.getInputProps('authorIds')}
            {...sharedInputProps()}
            description="Authors are assigned at the collection level and will be inherited by content."
          />

          <Group gap={4} mt={-6} align="center" className="text-primary">
            <Text size="xs" c="dimmed">
              Can't find the author you need?
            </Text>
            <Anchor
              component="button"
              type="button"
              onClick={() => setOpenNewAuthorModal(true)}
              fw={600}
              size="xs"
            >
              Create New Author
            </Anchor>
          </Group>

          <Select
            label="Content Type"
            placeholder="Select type"
            required
            data={contentTypes}
            {...form.getInputProps('mode')}
            {...sharedInputProps()}
          />

          <MultiSelect
            label="Genres"
            placeholder="Select genres"
            required
            data={genres}
            searchable
            {...form.getInputProps('genre')}
            {...sharedInputProps()}
          />

          <Group justify="flex-end" mt="md">
            <AppButton
              variant="default"
              onClick={onClose}
              loading={isCreating}
              disabled={isCreating}
            >
              Cancel
            </AppButton>
            <AppButton type="submit" loading={isCreating} disabled={isCreating}>
              {collectionToEdit ? 'Update Collection' : 'Create Collection'}
            </AppButton>
          </Group>
        </Stack>
      </Box>

      <CreateAuthorModal
        opened={openNewAuthorModal}
        onClose={() => setOpenNewAuthorModal(false)}
        onCreated={handleAuthorCreated}
      />
    </Modal>
  )
}

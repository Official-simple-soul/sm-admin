import { modalBaseProps, sharedInputProps } from '@/constant/ui'
import { useAuthor } from '@/services/author.service'
import { colors } from '@/theme/theme'
import type { Author } from '@/types/author.type'
import {
  ActionIcon,
  Box,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { AppButton } from '../AppButton'

interface CreateAuthorModalProps {
  opened: boolean
  onClose: () => void
  onCreated?: (authors: Author[]) => void
  onUpdated?: (author: Author) => void
  authorToEdit?: Author | null
}

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ')

const splitAuthorInput = (value: string) =>
  value
    .split(/,|\s+and\s+/i)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)

export function CreateAuthorModal({
  opened,
  onClose,
  onCreated,
  onUpdated,
  authorToEdit,
}: CreateAuthorModalProps) {
  const { createAuthor, updateAuthor, isCreating, isUpdating, getAuthorByName } =
    useAuthor()
  const [authorInputs, setAuthorInputs] = useState([''])
  const [editName, setEditName] = useState('')

  const isEditMode = !!authorToEdit

  useEffect(() => {
    if (!opened) {
      setAuthorInputs([''])
      setEditName('')
      return
    }

    if (authorToEdit) {
      setEditName(authorToEdit.name)
    } else {
      setAuthorInputs([''])
      setEditName('')
    }
  }, [opened, authorToEdit])

  const authorRows = useMemo(() => authorInputs, [authorInputs])

  const updateAuthorInput = (index: number, value: string) => {
    setAuthorInputs((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? value : item)),
    )
  }

  const addAuthorInput = () => {
    setAuthorInputs((prev) => [...prev, ''])
  }

  const removeAuthorInput = (index: number) => {
    setAuthorInputs((prev) => {
      if (prev.length === 1) return ['']
      return prev.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  const handleSubmit = async () => {
    try {
      if (isEditMode && authorToEdit) {
        const trimmedName = normalizeWhitespace(editName)

        if (!trimmedName) {
          notifications.show({
            title: 'Validation Error',
            message: 'Author name is required',
            color: 'red',
          })
          return
        }

        const existing = await getAuthorByName(trimmedName)
        if (existing && existing.id !== authorToEdit.id) {
          notifications.show({
            title: 'Author exists',
            message: `${existing.name} already exists and cannot be duplicated.`,
            color: 'red',
          })
          return
        }

        await updateAuthor({ id: authorToEdit.id, data: { name: trimmedName } })

        const updatedAuthor: Author = {
          ...authorToEdit,
          name: trimmedName,
        }

        notifications.show({
          title: 'Success',
          message: 'Author updated successfully',
          color: colors.primary,
        })
        onUpdated?.(updatedAuthor)
        onClose()
        return
      }

      const candidateNames = Array.from(
        new Set(
          authorInputs
            .flatMap((input) => splitAuthorInput(input))
            .map((name) => normalizeWhitespace(name))
            .filter(Boolean),
        ),
      )

      if (candidateNames.length === 0) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please enter at least one author name',
          color: 'red',
        })
        return
      }

      const savedAuthors: Author[] = []

      for (const name of candidateNames) {
        const existing = await getAuthorByName(name)

        if (existing) {
          savedAuthors.push(existing)
          continue
        }

        const author = await createAuthor({ name })
        savedAuthors.push(author)
      }

      notifications.show({
        title: 'Success',
        message:
          savedAuthors.length > 1
            ? `${savedAuthors.length} authors ready for use`
            : 'Author created successfully',
        color: colors.primary,
      })
      onCreated?.(savedAuthors)
      onClose()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEditMode ? 'update' : 'create'} author: ${
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
      title={<Text fw={600}>{isEditMode ? 'Edit Author' : 'Create New Author'}</Text>}
      centered
      zIndex={1000}
      {...modalBaseProps()}
    >
      <Box component="form" onSubmit={(event) => event.preventDefault()}>
        <Stack gap="md">
          {isEditMode ? (
            <TextInput
              label="Author Name"
              placeholder="Enter author name"
              required
              value={editName}
              onChange={(event) => setEditName(event.currentTarget.value)}
              description="This will update the canonical author name."
              {...sharedInputProps()}
            />
          ) : (
            <Stack gap="sm">
              <Text fw={500} size="sm">
                Author Names
              </Text>
              <Text size="xs" c="dimmed">
                Add one author per field. You can also paste comma-separated
                names and they will be split automatically.
              </Text>

              {authorRows.map((value, index) => (
                <Group key={index} align="flex-start" wrap="nowrap">
                  <TextInput
                    placeholder={`Author name ${index + 1}`}
                    required
                    className="flex-1"
                    value={value}
                    onChange={(event) =>
                      updateAuthorInput(index, event.currentTarget.value)
                    }
                    {...sharedInputProps()}
                  />
                  <ActionIcon
                    variant="light"
                    color="gray"
                    size="lg"
                    mt={4}
                    onClick={() => removeAuthorInput(index)}
                    disabled={authorRows.length === 1}
                    aria-label="Remove author row"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}

              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Collection authors can have multiple names.
                </Text>
                <AppButton
                  type="button"
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={addAuthorInput}
                >
                  Add another author
                </AppButton>
              </Group>
            </Stack>
          )}

          <Group justify="flex-end" mt="md">
            <AppButton
              variant="default"
              onClick={onClose}
              loading={isLoading}
              disabled={isLoading}
            >
              Cancel
            </AppButton>
            <AppButton type="button" onClick={handleSubmit} loading={isLoading} disabled={isLoading}>
              {isEditMode ? 'Update Author' : 'Create Author'}
            </AppButton>
          </Group>
        </Stack>
      </Box>
    </Modal>
  )
}

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
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { AppButton } from '../AppButton'

interface CreateAuthorModalProps {
  opened: boolean
  onClose: () => void
  onCreated?: (authors: Author[]) => void
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
}: CreateAuthorModalProps) {
  const { createAuthor, isCreating, getAuthorByName } = useAuthor()
  const [authorInputs, setAuthorInputs] = useState([''])

  const form = useForm({
    initialValues: { name: '' },
    validate: {
      name: (value) => (value.trim() ? null : 'Author name is required'),
    },
  })

  useEffect(() => {
    if (!opened) {
      form.reset()
      setAuthorInputs([''])
    }
  }, [opened])

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
    console.log('begin')
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

    console.log('pass validation')

    try {
      console.log('start try')
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
      form.reset()
      setAuthorInputs([''])
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to create author: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        color: colors.danger,
      })
    }
  }

  console.log({ isCreating })

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Create New Author</Text>}
      centered
      zIndex={1000}
      {...modalBaseProps()}
    >
      <Box>
        <Stack gap="md">
          <Stack gap="sm">
            <Text fw={500} size="sm">
              Author Names
            </Text>
            <Text size="xs" c="dimmed">
              Add one author per field. You can also paste comma-separated names
              and they will be split automatically.
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

          <Group justify="flex-end" mt="md">
            <AppButton
              variant="default"
              onClick={onClose}
              loading={isCreating}
              disabled={isCreating}
            >
              Cancel
            </AppButton>
            <AppButton
              type="button"
              loading={isCreating}
              disabled={isCreating}
              onClick={handleSubmit}
            >
              Create Author
            </AppButton>
          </Group>
        </Stack>
      </Box>
    </Modal>
  )
}

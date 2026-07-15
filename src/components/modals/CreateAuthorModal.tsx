import { modalBaseProps, sharedInputProps } from '@/constant/ui'
import { useAuthor } from '@/services/author.service'
import { colors } from '@/theme/theme'
import type { Author } from '@/types/author.type'
import { Box, Group, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useEffect } from 'react'
import { AppButton } from '../AppButton'

interface CreateAuthorModalProps {
  opened: boolean
  onClose: () => void
  onCreated?: (author: Author) => void
}

export function CreateAuthorModal({
  opened,
  onClose,
  onCreated,
}: CreateAuthorModalProps) {
  const { createAuthor, isCreating, getAuthorByName } = useAuthor()

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.trim() ? null : 'Author name is required'),
    },
  })

  useEffect(() => {
    if (!opened) {
      form.reset()
    }
  }, [opened])

  const handleSubmit = async (values: typeof form.values) => {
    const existing = await getAuthorByName(values.name)

    if (existing) {
      notifications.show({
        title: 'Author exists',
        message: `${existing.name} already exists and will be reused.`,
        color: colors.primary,
      })
      onCreated?.(existing)
      onClose()
      form.reset()
      return
    }

    try {
      const author = await createAuthor({
        name: values.name,
      })

      notifications.show({
        title: 'Success',
        message: 'Author created successfully',
        color: colors.primary,
      })
      onCreated?.(author)
      onClose()
      form.reset()
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

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Create New Author</Text>}
      centered
      {...modalBaseProps()}
    >
      <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Author Name"
            placeholder="Enter author name"
            required
            {...form.getInputProps('name')}
            {...sharedInputProps()}
            description="This will be used as the canonical author name."
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
              Create Author
            </AppButton>
          </Group>
        </Stack>
      </Box>
    </Modal>
  )
}

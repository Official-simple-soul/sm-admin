import { modalBaseProps, sharedInputProps } from '@/constant/ui'
import { useContent } from '@/services/content.service'
import { useCreateGalleryImage } from '@/services/gallery.service'
import { colors } from '@/theme/theme'
import type { GalleryUploader } from '@/types/gallery.type'
import { uploadFileToStorage } from '@/utils/fileUpload'
import {
  ActionIcon,
  FileInput,
  Group,
  Image,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconPhoto, IconX } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { AppButton } from '../AppButton'

interface CreateGalleryImageModalProps {
  opened: boolean
  onClose: () => void
  uploader: GalleryUploader
  onCreated?: () => void
}

/** Reads a file's real pixel dimensions client-side (via a throwaway
 * `<img>`) so the gallery doc stores the image's true aspect ratio — the web
 * gallery lays tiles out at that ratio instead of forcing a uniform shape. */
function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read image dimensions'))
    }
    img.src = objectUrl
  })
}

// Uncompressed phone/stock photos routinely land at several MB. Firebase
// Storage is occasionally slow to serve those back out (seen up to ~19s for
// a 2.5MB file), and Next's built-in image optimizer times out waiting on
// the source fetch when that happens — which shows up as an intermittent
// 500 on /_next/image, not a real network problem. Downscaling oversized
// images before upload keeps files small enough that this doesn't happen.
const MAX_DIMENSION = 2200

/** No-ops (returns the original file) for images already within
 * `MAX_DIMENSION` — only pays the canvas re-encode cost when it's actually
 * needed. Preserves the original file type, so PNG transparency survives. */
function downscaleImageIfNeeded(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()

    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img

      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        URL.revokeObjectURL(objectUrl)
        resolve(file)
        return
      }

      const scale = MAX_DIMENSION / Math.max(width, height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl)
          resolve(blob ? new File([blob], file.name, { type: file.type }) : file)
        },
        file.type,
        0.85,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read image for resizing'))
    }

    img.src = objectUrl
  })
}

export function CreateGalleryImageModal({
  opened,
  onClose,
  uploader,
  onCreated,
}: CreateGalleryImageModalProps) {
  const { content } = useContent()
  const { mutateAsync: createGalleryImage, isPending: isCreating } =
    useCreateGalleryImage()

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [relatedContentId, setRelatedContentId] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!opened) {
      setFiles([])
      setPreviews([])
      setTitle('')
      setRelatedContentId(null)
      setFileError(null)
    }
  }, [opened])

  const contentOptions = useMemo(
    () => content.map((item) => ({ value: item.id, label: item.title })),
    [content],
  )

  const handleFilesChange = (nextFiles: File[]) => {
    setFiles(nextFiles)
    setFileError(null)
    previews.forEach((url) => URL.revokeObjectURL(url))
    setPreviews(nextFiles.map((file) => URL.createObjectURL(file)))
  }

  const removeFileAt = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setFiles((current) => current.filter((_, i) => i !== index))
    setPreviews((current) => current.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      setFileError('Please choose at least one image to upload')
      return
    }

    setIsUploading(true)
    try {
      await Promise.all(
        files.map(async (file) => {
          const optimizedFile = await downscaleImageIfNeeded(file)
          const { width, height } = await readImageDimensions(optimizedFile)
          const path = `gallery/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name.replace(/\s+/g, '_')}`
          const imageUrl = await uploadFileToStorage(optimizedFile, path)

          await createGalleryImage({
            imageUrl,
            width,
            height,
            title: title.trim() || 'Other',
            uploader,
            relatedContentId: relatedContentId ?? 'Other',
            isApproved: true,
          })
        }),
      )

      notifications.show({
        title: 'Success',
        message:
          files.length > 1
            ? `${files.length} images added to the gallery`
            : 'Image added to the gallery',
        color: colors.primary,
      })
      onCreated?.()
      onClose()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to upload image: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        color: colors.danger,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const isLoading = isCreating || isUploading
  const col = previews.length > 1 ? 2 : 1
  const isOdd = previews.length % 2 === 1

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Add Gallery Images</Text>}
      centered
      zIndex={1000}
      {...modalBaseProps()}
    >
      <Stack gap="md">
        <FileInput
          label="Images"
          placeholder="Choose one or more images"
          accept="image/png,image/jpeg,image/webp"
          leftSection={<IconPhoto size={16} />}
          value={files}
          onChange={handleFilesChange}
          error={fileError}
          required
          multiple
          {...sharedInputProps()}
        />

        {previews.length > 0 && (
          <SimpleGrid cols={col} spacing="xs">
            {previews.map((url, index) => (
              <div
                key={url}
                className={`relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 ${isOdd && isOdd && index === previews.length - 1 ? 'col-span-2' : ''}`}
              >
                <Image src={url} alt="" h={90} fit="cover" />
                <ActionIcon
                  size="xs"
                  radius="xl"
                  color="dark"
                  variant="filled"
                  className="absolute bottom-0.5 left-2 opacity-90"
                  onClick={() => removeFileAt(index)}
                  aria-label="Remove image"
                >
                  <IconX size={8} />
                </ActionIcon>
              </div>
            ))}
          </SimpleGrid>
        )}

        <TextInput
          label="Title (optional)"
          description={
            files.length > 1
              ? 'Applied to every image in this batch'
              : undefined
          }
          placeholder="Give these images a caption"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          {...sharedInputProps()}
        />

        <Select
          label="Related content (optional)"
          description=""
          placeholder="Search content..."
          data={contentOptions}
          value={relatedContentId}
          onChange={setRelatedContentId}
          searchable
          clearable
          comboboxProps={{ zIndex: 1001, withinPortal: true }}
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
          <AppButton
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          >
            {files.length > 1 ? `Add ${files.length} Images` : 'Add Image'}
          </AppButton>
        </Group>
      </Stack>
    </Modal>
  )
}

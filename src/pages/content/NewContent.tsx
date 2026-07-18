import { AppButton } from '@/components/AppButton'
import ActionModal from '@/components/modals/ActionModal'
import { CreateCollectionModal } from '@/components/modals/CreateCollectionModal'
import PageHeader from '@/components/PageHeader'
import { fileSize } from '@/constant/constant'
import { sharedInputProps } from '@/constant/ui'
import { useAnalytics } from '@/services/analytics.service'
import { useAuthor } from '@/services/author.service'
import { useCategory } from '@/services/category.service'
import { useCollection } from '@/services/collection.service'
import { useContent } from '@/services/content.service'
import { colors } from '@/theme/theme'
import type { Content } from '@/types/content.type'
import { uploadFileToStorage } from '@/utils/fileUpload'
import { generateContentKey } from '@/utils/helper'
import {
  Alert,
  Badge,
  Box,
  Card,
  Divider,
  FileInput,
  Flex,
  Grid,
  Group,
  Image,
  List,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Stack,
  Stepper,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  IconBook,
  IconCategory,
  IconCategoryPlus,
  IconCheck,
  IconClock,
  IconFileTypePdf,
  IconInfoCircle,
  IconPhoto,
  IconPlus,
  IconSparkles,
  IconUpload,
  IconVideo,
  IconVideoFilled,
  IconX,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { Timestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'

interface CreateContentModalProps {
  contentToEdit?: Content | null
}

type ContentImageField = 'thumbnail' | 'poster' | 'backdrop'

interface ContentImageState {
  file: File | null
  preview: string | null
  error: string | null
}

type SubmitIntent = 'publish' | 'draft'

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
]

const UPLOAD_STEPS = [
  {
    label: 'Basic Info',
    icon: <IconInfoCircle size={16} />,
    description: 'Add title, package, and tag line',
  },
  {
    label: 'Content Details',
    icon: <IconBook size={16} />,
    description: 'Select collection and category to auto-fill details',
  },
  {
    label: 'Additional Details',
    icon: <IconInfoCircle size={16} />,
    description: 'Add duration and preview',
  },
  {
    label: 'Media Upload',
    icon: <IconUpload size={16} />,
    description: 'Upload images and media files',
  },
  {
    label: 'Publish',
    icon: <IconSparkles size={16} />,
    description: 'Review and publish your content',
  },
]

const validateFileSize = (
  file: File | null,
  maxSizeMB: number,
): string | null => {
  if (!file) return null
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`
  }
  return null
}

const validateImage = (file: File | null): string | null => {
  return validateFileSize(file, fileSize.cover) // 1MB
}

const validatePDF = (file: File | null): string | null => {
  return validateFileSize(file, fileSize.pdf) // 5MB
}

const validateVideo = (file: File | null): string | null => {
  return validateFileSize(file, fileSize.video) // 200MB
}

const IMAGE_REQUIREMENTS: Record<
  ContentImageField,
  {
    label: string
    description: string
    minWidth: number
    minHeight: number
    ratioMin: number
    ratioMax: number
    aspectRatio: string
  }
> = {
  thumbnail: {
    label: 'Thumbnail',
    description: 'Best for cards and compact library views.',
    minWidth: 600,
    minHeight: 900,
    ratioMin: 0.62,
    ratioMax: 0.72,
    aspectRatio: '2 / 3',
  },
  poster: {
    label: 'Poster',
    description: 'Optional. Use for side panels and featured layouts.',
    minWidth: 900,
    minHeight: 1200,
    ratioMin: 0.72,
    ratioMax: 0.84,
    aspectRatio: '3 / 4',
  },
  backdrop: {
    label: 'Backdrop',
    description:
      'Used for heroes and wide banner sections. 16:9 to 2:1 works best.',
    minWidth: 1280,
    minHeight: 720,
    ratioMin: 1.5,
    ratioMax: 2.1,
    aspectRatio: '16 / 9',
  },
}

const CATEGORY_ICONS = [
  { value: 'book', label: 'Book' },
  { value: 'video', label: 'Video' },
  { value: 'movie', label: 'Movie' },
  { value: 'tv', label: 'TV' },
  { value: 'game', label: 'Game' },
  { value: 'music', label: 'Music' },
  { value: 'art', label: 'Art' },
  { value: 'sports', label: 'Sports' },
  { value: 'tech', label: 'Tech' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'news', label: 'News' },
]

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ')

const normalizeAuthorKey = (value: string) =>
  normalizeWhitespace(value).toLowerCase().replace(/[-_]+/g, ' ')

const splitAuthorInput = (value: string) =>
  value
    .split(/,|\s+and\s+/i)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)

const resolveAuthorIdsFromText = (
  rawValue: string,
  authorOptions: Array<{ id: string; name: string }>,
) => {
  const names = splitAuthorInput(rawValue)
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

const resolveAuthorsFromIds = (
  authorIds: string[],
  authorOptions: Array<{ id: string; name: string }>,
) => {
  const ids = new Set(authorIds)
  return authorOptions.filter((author) => ids.has(author.id))
}

const createEmptyImageState = (): ContentImageState => ({
  file: null,
  preview: null,
  error: null,
})

const createEmptyImageStates = (): Record<
  ContentImageField,
  ContentImageState
> =>
  ({
    thumbnail: createEmptyImageState(),
    poster: createEmptyImageState(),
    backdrop: createEmptyImageState(),
  }) satisfies Record<ContentImageField, ContentImageState>

const loadImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new window.Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to read image dimensions'))
    }

    image.src = objectUrl
  })

const validateContentImage = async (
  file: File,
  field: ContentImageField,
): Promise<string | null> => {
  const sizeError = validateImage(file)
  if (sizeError) return sizeError

  const requirements = IMAGE_REQUIREMENTS[field]

  try {
    const { width, height } = await loadImageDimensions(file)
    const ratio = width / height

    if (width < requirements.minWidth || height < requirements.minHeight) {
      return `${requirements.label} must be at least ${requirements.minWidth}x${requirements.minHeight}px`
    }

    if (ratio < requirements.ratioMin || ratio > requirements.ratioMax) {
      return `${requirements.label} should be close to ${requirements.aspectRatio} ratio`
    }
  } catch {
    return `Unable to read ${requirements.label.toLowerCase()} dimensions`
  }

  return null
}

function NewContent({ contentToEdit }: CreateContentModalProps) {
  const [contentType, setContentType] = useState<'reading' | 'watching'>(
    'reading',
  )
  const [contentImages, setContentImages] = useState<
    Record<ContentImageField, ContentImageState>
  >(createEmptyImageStates)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const { authors } = useAuthor()
  const { collections, incrementCollectionCount } = useCollection()
  const { analytics, incrementAnalyticsCount } = useAnalytics()
  const { createContent, updateContent } = useContent()
  const {
    categories: allCategories,
    isLoading: categoriesLoading,
    createCategory,
    isCreating,
  } = useCategory()
  const [mediaFileError, setMediaFileError] = useState<string | null>(null)
  const [isScheduled, setIsScheduled] = useState(false)
  const [openNewCollectionModal, setOpenNewCollectionModal] = useState(false)
  const [openNewCategoryModal, setOpenNewCategoryModal] = useState(false)
  const [contentCreatedModalOpen, setContentCreatedModalOpen] = useState(false)
  const [lastSubmitIntent, setLastSubmitIntent] =
    useState<SubmitIntent>('publish')
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCollectionAuthors, setSelectedCollectionAuthors] = useState<
    Array<{ id: string; name: string }>
  >([])
  const isReading = contentType === 'reading'

  const updateContentImageState = (
    field: ContentImageField,
    next: Partial<ContentImageState>,
  ) => {
    setContentImages((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        ...next,
      },
    }))
  }

  const form = useForm({
    initialValues: {
      title: '',
      tagLine: '',
      collection: '',
      collectionId: '',
      collectionNum: 1,
      genre: [] as string[],
      synopsis: '',
      package: 'free' as 'free' | 'premium',
      mode: 'reading' as 'reading' | 'watching',
      length: 1,
      scheduledDate: '',
      categoryId: '',
      categoryName: '',
    },

    validate: {
      title: (value) => (value.trim() ? null : 'Title is required'),
      collection: (value) => (value.trim() ? null : 'Collection is required'),
      categoryId: (value) => (value.trim() ? null : 'Category is required'),
      genre: (value) =>
        value.length > 0 ? null : 'At least one genre is required',
      synopsis: (value) =>
        value.trim() ? null : 'Preview description is required',
      length: (value) =>
        !value || value < 1
          ? `Length must be at least 1 ${isReading ? 'page' : 'minute'}`
          : null,
    },
  })

  const newCategoryForm = useForm({
    initialValues: {
      name: '',
      icon: 'book',
    },
    validate: {
      name: (value) => (value.trim() ? null : 'Category name is required'),
    },
  })

  const handleContentImageChange = async (
    field: ContentImageField,
    file: File | null,
  ) => {
    updateContentImageState(field, {
      file,
      error: null,
    })

    if (!file) {
      updateContentImageState(field, { preview: null })
      return
    }

    const error = await validateContentImage(file, field)
    if (error) {
      updateContentImageState(field, {
        error,
        preview: null,
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      updateContentImageState(field, {
        preview: event.target?.result as string,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleMediaFileChange = (file: File | null) => {
    setMediaFile(file)
    setMediaFileError(null)

    if (file) {
      const error = isReading ? validatePDF(file) : validateVideo(file)
      if (error) {
        setMediaFileError(error)
      }
    }
  }

  const handleCollectionChange = (collectionId: string) => {
    const selectedCollection = collections.find(
      (col) => col.id === collectionId,
    )
    if (selectedCollection) {
      const collectionAuthorIds =
        Array.isArray(selectedCollection.authorIds) &&
        selectedCollection.authorIds.length > 0
          ? selectedCollection.authorIds
          : Array.isArray(selectedCollection.authors) &&
              selectedCollection.authors.length > 0
            ? selectedCollection.authors.map((author) => author.id)
            : resolveAuthorIdsFromText(selectedCollection.author || '', authors)
      const collectionAuthors = resolveAuthorsFromIds(
        collectionAuthorIds,
        authors,
      )
      form.setValues({
        ...form.values,
        collection: selectedCollection.name,
        collectionId: selectedCollection.id,
        genre: selectedCollection.genre,
        collectionNum: (selectedCollection.count || 0) + 1,
        mode: selectedCollection.mode,
      })
      setSelectedCollectionAuthors(collectionAuthors)
      setContentType(selectedCollection.mode as 'reading' | 'watching')
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = allCategories.find((cat) => cat.id === categoryId)
    if (selectedCategory) {
      form.setValues({
        ...form.values,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
      })
    }
  }

  useEffect(() => {
    if (!form.values.collectionId) return

    const selectedCollection = collections.find(
      (collection) => collection.id === form.values.collectionId,
    )

    if (!selectedCollection) return

    const collectionAuthorIds =
      Array.isArray(selectedCollection.authorIds) &&
      selectedCollection.authorIds.length > 0
        ? selectedCollection.authorIds
        : Array.isArray(selectedCollection.authors) &&
            selectedCollection.authors.length > 0
          ? selectedCollection.authors.map((author) => author.id)
          : resolveAuthorIdsFromText(selectedCollection.author || '', authors)
    const collectionAuthors = resolveAuthorsFromIds(
      collectionAuthorIds,
      authors,
    )

    setSelectedCollectionAuthors(collectionAuthors)
  }, [authors, collections, form.values.collectionId])

  const handleCreateNewCategory = async () => {
    const { name, icon } = newCategoryForm.values

    if (!name.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please enter a category name',
        color: 'red',
      })
      return
    }

    try {
      const categoryId = name.toLowerCase().replace(/\s+/g, '-')

      await createCategory({
        id: categoryId,
        name,
        icon,
        mode: contentType,
      })

      notifications.show({
        title: 'Success',
        message: 'Category created successfully',
        color: 'green',
      })

      form.setValues({
        ...form.values,
        categoryId: categoryId,
        categoryName: name,
      })

      newCategoryForm.reset()
      setOpenNewCategoryModal(false)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create category',
        color: 'red',
      })
    }
  }

  const renderContentImageField = (field: ContentImageField) => {
    const requirements = IMAGE_REQUIREMENTS[field]
    const state = contentImages[field]

    return (
      <Card
        withBorder
        radius="lg"
        className="h-full bg-background/80 backdrop-blur-sm"
      >
        <Stack gap="sm">
          <Group justify="space-between" align="start" wrap="nowrap">
            <div>
              <Text fw={600} size="md">
                {requirements.label}
              </Text>
              <Text size="xs" c="dimmed">
                {requirements.description}
              </Text>
            </div>
            <Badge variant="light" color={colors.primary}>
              {requirements.aspectRatio}
            </Badge>
          </Group>

          <FileInput
            label={`Upload ${requirements.label.toLowerCase()}`}
            placeholder={`Choose ${requirements.label.toLowerCase()}`}
            accept="image/png,image/jpeg,image/webp"
            leftSection={<IconPhoto size={16} />}
            value={state.file}
            onChange={(file) => handleContentImageChange(field, file)}
            required={!contentToEdit && field !== 'poster'}
            description={`Max size: ${fileSize.cover}MB • Minimum: ${requirements.minWidth}×${requirements.minHeight}px`}
            error={state.error}
            {...sharedInputProps()}
          />

          <div>
            <Text size="sm" fw={500} mb="xs">
              Preview
            </Text>
            <div
              className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100"
              style={{ aspectRatio: requirements.aspectRatio }}
            >
              {state.preview ? (
                <Image
                  src={state.preview}
                  alt={`${requirements.label} preview`}
                  h="100%"
                  w="100%"
                  fit="cover"
                  radius="md"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white to-gray-100 text-center">
                  <div className="space-y-1 px-4">
                    <IconPhoto size={22} className="mx-auto text-gray-400" />
                    <Text size="xs" c="dimmed">
                      {requirements.label} preview will appear here
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Stack>
      </Card>
    )
  }

  useEffect(() => {
    if (contentToEdit) {
      const existingAuthorIds =
        Array.isArray(contentToEdit.authorIds) &&
        contentToEdit.authorIds.length > 0
          ? contentToEdit.authorIds
          : Array.isArray(contentToEdit.authors)
            ? contentToEdit.authors.map((author) => author.id)
            : resolveAuthorIdsFromText(contentToEdit.author || '', authors)
      const existingAuthors = resolveAuthorsFromIds(existingAuthorIds, authors)
      form.setValues({
        title: contentToEdit.title,
        tagLine: contentToEdit.tagLine,
        collection: contentToEdit.collection || '',
        collectionId: contentToEdit.collectionId,
        collectionNum: contentToEdit.collectionNum,
        genre: contentToEdit.genre,
        synopsis: contentToEdit.synopsis,
        package: contentToEdit.package as 'free',
        mode: contentToEdit.mode,
        length: contentToEdit.length,
        categoryId: contentToEdit.categoryId || '',
        categoryName: contentToEdit.categoryName || '',
      })
      setSelectedCollectionAuthors(existingAuthors)
      setContentType(contentToEdit.mode)
      setIsScheduled(!!contentToEdit.scheduledDate)
      const existingThumbnail =
        contentToEdit.images?.thumbnail || contentToEdit.thumbnail || null
      const existingPoster =
        contentToEdit.images?.poster || contentToEdit.thumbnail || null
      const existingBackdrop =
        contentToEdit.images?.backdrop || contentToEdit.thumbnail || null
      setContentImages({
        thumbnail: { file: null, preview: existingThumbnail, error: null },
        poster: { file: null, preview: existingPoster, error: null },
        backdrop: { file: null, preview: existingBackdrop, error: null },
      })
    } else {
      form.reset()
      setMediaFile(null)
      setIsScheduled(false)
      setContentImages(createEmptyImageStates())
      setSelectedCollectionAuthors([])
    }
  }, [contentToEdit])

  const handleSubmit = async (
    values: typeof form.values,
    intent: SubmitIntent = 'publish',
  ) => {
    const selectedCollection = collections.find(
      (e) => e.id === values.collectionId,
    )
    const selectedAuthorIds = selectedCollectionAuthors.map((author) => author.id)
    const isDraftSave = intent === 'draft'
    const finalStatus: 'draft' | 'published' = isDraftSave
      ? 'draft'
      : 'published'

    if (selectedCollection?.mode !== contentType) {
      notifications.show({
        title: 'Selected Collection Error',
        message: `The selected collection mode (${selectedCollection?.mode}) does not match with the type of content you are creating (${contentType})`,
        color: 'red',
      })
      return
    }

    setIsLoading(true)
    try {
      const imageFields: ContentImageField[] = [
        'thumbnail',
        'poster',
        'backdrop',
      ]
      const requiredImageFields: ContentImageField[] = ['thumbnail', 'backdrop']

      if (!isDraftSave) {
        for (const field of requiredImageFields) {
          const current = contentImages[field]
          if (!contentToEdit && !current.file) {
            updateContentImageState(field, {
              error: `${IMAGE_REQUIREMENTS[field].label} is required`,
            })
            notifications.show({
              title: 'Validation Error',
              message: `${IMAGE_REQUIREMENTS[field].label} is required`,
              color: 'red',
            })
            return
          }
        }

        if (!contentToEdit) {
          if (!mediaFile) {
            setMediaFileError('Media file is required')
            return
          }
        }
      }

      const hasImageErrors = imageFields.some((field) =>
        Boolean(contentImages[field].error),
      )

      if (hasImageErrors || mediaFileError) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please fix the file upload errors',
          color: 'red',
        })
        return
      }

      const contentValues = values

      const imagePathBase = values.title.replace(/\s+/g, '_')
      const existingImages = contentToEdit?.images
      const resolveExistingImageUrl = (field: ContentImageField) =>
        field === 'thumbnail'
          ? existingImages?.thumbnail || contentToEdit?.thumbnail || ''
          : field === 'poster'
            ? existingImages?.poster || contentToEdit?.thumbnail || ''
            : existingImages?.backdrop || contentToEdit?.thumbnail || ''

      const nextImageUrls = {
        thumbnail: resolveExistingImageUrl('thumbnail'),
        poster: resolveExistingImageUrl('poster'),
        backdrop: resolveExistingImageUrl('backdrop'),
      }

      let mediaUrl = contentToEdit?.contentUrl || ''

      for (const field of ['thumbnail', 'poster', 'backdrop'] as const) {
        const current = contentImages[field]
        if (!current.file) continue

        const imagePath = `contents/${field}/${imagePathBase}${values.collectionNum}`
        nextImageUrls[field] = await uploadFileToStorage(
          current.file,
          imagePath,
        )
      }

      if (!nextImageUrls.poster) {
        nextImageUrls.poster = nextImageUrls.thumbnail
      }

      if (mediaFile) {
        const mediaPath = isReading
          ? `contents/pdf/${values.title.replace(/\s+/g, '_')}${values.collectionNum}`
          : `contents/video/${values.title.replace(/\s+/g, '_')}${values.collectionNum}`
        mediaUrl = await uploadFileToStorage(mediaFile, mediaPath)
      }

      if (contentToEdit) {
        console.log('values', values)
        const contentData = {
          ...contentValues,
          authorIds: selectedAuthorIds,
          type: contentType,
          status: finalStatus,
          thumbnail: nextImageUrls.thumbnail,
          images: nextImageUrls,
          contentUrl: mediaUrl,
          ...(values.scheduledDate && { scheduledDate: values.scheduledDate }),
          key: generateContentKey(values.title, values.collectionNum),
        }

        await updateContent({
          id: contentToEdit.id!,
          data: contentData,
        })
      } else {
        const contentData = {
          ...contentValues,
          authorIds: selectedAuthorIds,
          id: `${values.categoryId}-${crypto.randomUUID()}`,
          type: contentType,
          status: finalStatus,
          thumbnail: nextImageUrls.thumbnail,
          images: nextImageUrls,
          contentUrl: mediaUrl,
          ...(values.scheduledDate && { scheduledDate: values.scheduledDate }),
          key: generateContentKey(values.title, values.collectionNum),
          num: (analytics?.content || 0) + 1,
          totalCompletions: 0,
          totalRatings: 0,
          totalViews: 0,
          view: 0,
          viewerIds: [],
          rating: 0,
          reviews: 0,
          uploadedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }
        await createContent(contentData)

        if (!isDraftSave) {
          await Promise.all([
            incrementCollectionCount(values.collectionId),
            incrementAnalyticsCount({ field: 'content', amount: 1 }),
          ])
        }

        notifications.show({
          title: 'Success',
          message: isDraftSave
            ? 'Draft saved successfully'
            : 'Content created successfully',
          color: colors.primary,
        })
        setLastSubmitIntent(intent)
        setContentCreatedModalOpen(true)
      }

      form.reset()
      setMediaFile(null)
      setContentImages(createEmptyImageStates())
    } catch (error) {
      console.error('Error submitting content:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to upload content. Please try again.',
        color: 'red',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublishSubmit = form.onSubmit((values) =>
    handleSubmit(values, 'publish'),
  )

  const handleDraftSubmit = form.onSubmit((values) =>
    handleSubmit(values, 'draft'),
  )

  return (
    <div className="">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PageHeader
            page={'contents'}
            actionLabel={contentToEdit ? 'Update Content' : 'Upload Content'}
            onAction={handlePublishSubmit}
            secondaryActionLabel={
              contentToEdit ? 'Save Draft' : 'Save as Draft'
            }
            secondaryOnAction={handleDraftSubmit}
            loading={isLoading}
            secondaryLoading={isLoading}
          />
          <Tabs
            defaultValue="flex"
            value={contentType}
            onChange={(v) => setContentType(v as 'reading' | 'watching')}
            mt={'xl'}
            color={colors.primary}
          >
            <Tabs.List grow mb="md">
              <Tabs.Tab value="reading" leftSection={<IconBook size={16} />}>
                Flex (Pdf)
              </Tabs.Tab>
              <Tabs.Tab value="watching" leftSection={<IconVideo size={16} />}>
                Watch (Video)
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <Box component="form" onSubmit={handlePublishSubmit}>
            <Stack gap="md">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Category"
                    placeholder={`Select a ${contentType} category`}
                    required
                    data={
                      allCategories?.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      })) || []
                    }
                    description="Categorize your content for better organization"
                    searchable
                    nothingFoundMessage="No categories found"
                    value={form.values.categoryId}
                    {...form.getInputProps('categoryId')}
                    onChange={(value) => {
                      form.getInputProps('categoryId').onChange(value)
                      if (value) handleCategoryChange(value)
                    }}
                    {...sharedInputProps()}
                    disabled={categoriesLoading}
                  />
                  <div className="flex items-center gap-1 mt-1 text-primary cursor-pointer">
                    <IconCategoryPlus size={12} />
                    <p
                      className="text-xs text-primary hover:underline"
                      onClick={() => setOpenNewCategoryModal(true)}
                    >
                      Create New Category
                    </p>
                  </div>
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={8}>
                  <TextInput
                    label="Title"
                    placeholder="Enter content title"
                    required
                    {...form.getInputProps('title')}
                    {...sharedInputProps()}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Select
                    label="Package"
                    required
                    data={[
                      { value: 'free', label: 'Free' },
                      { value: 'premium', label: 'Premium' },
                    ]}
                    {...form.getInputProps('package')}
                    {...sharedInputProps()}
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                label="Tagline"
                placeholder="Enter a catchy tagline"
                {...form.getInputProps('tagLine')}
                {...sharedInputProps()}
              />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Collection"
                    placeholder="Select a collection"
                    required
                    data={collections.map((col) => ({
                      value: col.id!,
                      label: col.name,
                    }))}
                    description="If this is a new comic starting from Issue #1, create a new collection."
                    searchable
                    {...form.getInputProps('collectionId')}
                    onChange={(value) => {
                      form.getInputProps('collectionId').onChange(value)
                      if (value) handleCollectionChange(value)
                    }}
                    {...sharedInputProps()}
                  />
                  <div className="flex items-center gap-1 mt-1 text-primary cursor-pointer">
                    <IconPlus size={12} />
                    <p
                      className="text-xs text-primary hover:underline"
                      onClick={() => setOpenNewCollectionModal(true)}
                    >
                      New Collection
                    </p>
                  </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <MultiSelect
                    label="Authors"
                    placeholder="Select a collection to populate authors"
                    data={authors.map((author) => ({
                      value: author.id,
                      label: author.name,
                    }))}
                    value={selectedCollectionAuthors.map((author) => author.id)}
                    readOnly
                    searchable
                    nothingFoundMessage="No authors found"
                    description="Authors are inherited from the selected collection and cannot be edited here."
                    {...sharedInputProps()}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Collection Number (Issue/Episode)"
                    placeholder="Sequence in collection"
                    min={1}
                    required
                    {...form.getInputProps('collectionNum')}
                    {...sharedInputProps()}
                    readOnly
                    description="This will be automatically populated based on the selected collection"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <MultiSelect
                    label="Genres"
                    placeholder="Select genres"
                    required
                    data={genres}
                    searchable
                    {...form.getInputProps('genre')}
                    {...sharedInputProps()}
                    readOnly
                    description="This will be automatically populated based on the selected collection"
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label={isReading ? 'Number of Pages' : 'Duration (minutes)'}
                    min={1}
                    required
                    {...form.getInputProps('length')}
                    {...sharedInputProps()}
                  />
                </Grid.Col>
              </Grid>

              <Textarea
                label="Preview Description"
                placeholder="Enter a short description of the content"
                required
                autosize
                minRows={3}
                {...form.getInputProps('synopsis')}
                {...sharedInputProps()}
              />

              <Divider my="sm" />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  {renderContentImageField('thumbnail')}
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  {renderContentImageField('poster')}
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  {renderContentImageField('backdrop')}
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <FileInput
                    label={isReading ? 'PDF File' : 'Video File'}
                    placeholder={`Upload ${isReading ? 'PDF' : 'video'}`}
                    accept={
                      isReading ? 'application/pdf' : 'video/mp4,video/webm'
                    }
                    leftSection={<IconUpload size={16} />}
                    value={mediaFile}
                    onChange={handleMediaFileChange}
                    required={!contentToEdit}
                    description={
                      isReading
                        ? `Max size: ${fileSize.pdf}MB`
                        : `Max size: ${fileSize.video}MB`
                    }
                    error={mediaFileError}
                    {...sharedInputProps()}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="sm" />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Switch
                    label="Schedule for later"
                    checked={isScheduled}
                    onChange={(event) =>
                      setIsScheduled(event.currentTarget.checked)
                    }
                    {...sharedInputProps()}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  {isScheduled && (
                    <div className="flex flex-col items-center justify-center">
                      <DatePicker
                        minDate={new Date()}
                        {...form.getInputProps('scheduledDate')}
                      />
                    </div>
                  )}
                </Grid.Col>
              </Grid>
            </Stack>
          </Box>
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <Paper
            withBorder
            p="md"
            radius="lg"
            className="sticky top-6 bg-background/80 backdrop-blur-sm"
          >
            <div className="mb-6">
              <Text fw={500} size="lg" mb="sm">
                Quick Guide
              </Text>
              <Stepper active={0} orientation="vertical" size="sm">
                {UPLOAD_STEPS.map((step, index) => (
                  <Stepper.Step
                    key={index}
                    label={step.label}
                    description={step.description}
                    icon={step.icon}
                    color={colors.primary}
                  />
                ))}
              </Stepper>
            </div>

            <Card withBorder radius="md" className="mb-6">
              <Text fw={500} size="lg" mb="md">
                📋 Requirements
              </Text>
              <List spacing="xs" size="sm" center>
                <List.Item icon={<IconPhoto size={16} />}>
                  Thumbnail image ({fileSize.cover}MB max)
                </List.Item>
                <List.Item icon={<IconPhoto size={16} />}>
                  Poster image ({fileSize.cover}MB max)
                </List.Item>
                <List.Item icon={<IconPhoto size={16} />}>
                  Backdrop image ({fileSize.cover}MB max, 16:9-ish ratio)
                </List.Item>
                <List.Item
                  icon={
                    isReading ? (
                      <IconFileTypePdf size={16} />
                    ) : (
                      <IconVideoFilled size={16} />
                    )
                  }
                >
                  {isReading
                    ? `PDF File (${fileSize.pdf}MB max)`
                    : `Video File (${fileSize.video}MB max)`}
                </List.Item>
                <List.Item icon={<IconCategory size={16} />}>
                  Select or create a category
                </List.Item>
                <List.Item icon={<IconInfoCircle size={16} />}>
                  Complete all required fields
                </List.Item>
              </List>
            </Card>

            {/* Tips & Best Practices */}
            <Card withBorder radius="md" className="mb-6">
              <Text fw={500} size="lg" mb="md">
                💡 Pro Tips
              </Text>
              <List spacing="xs" size="sm">
                <List.Item>
                  Upload a consistent thumbnail, poster, and backdrop set
                </List.Item>
                <List.Item>
                  Choose appropriate categories for better organization
                </List.Item>
                <List.Item>Write engaging preview descriptions</List.Item>
                <List.Item>
                  Select relevant genres for better discovery
                </List.Item>
                <List.Item>
                  Keep the backdrop wide and cinematic, but not too strict on
                  exact pixels
                </List.Item>
                <List.Item>Schedule releases for optimal timing</List.Item>
              </List>
            </Card>

            <Alert
              variant="light"
              color={colors.primary}
              title="Status Guide"
              icon={<IconInfoCircle />}
            >
              <Text size="sm">
                <strong>Draft:</strong> Save for later editing
                <br />
                <strong>Published:</strong> Make immediately visible to users
              </Text>
            </Alert>

            {isScheduled && (
              <Alert
                variant="light"
                color="orange"
                title="Scheduled Release"
                icon={<IconClock />}
                mt="md"
              >
                <Text size="sm">
                  Your content will be automatically published on the selected
                  date
                </Text>
              </Alert>
            )}

            {form.values.package === 'premium' && (
              <Alert
                variant="light"
                color="yellow"
                title="Premium Benefits"
                icon={<IconSparkles />}
                mt="md"
              >
                <Text size="sm">
                  Premium content generates revenue and gets featured placement
                </Text>
              </Alert>
            )}
          </Paper>
        </div>
      </div>

      <CreateCollectionModal
        opened={openNewCollectionModal}
        onClose={() => setOpenNewCollectionModal(false)}
      />

      <Modal
        opened={openNewCategoryModal}
        onClose={() => setOpenNewCategoryModal(false)}
        title={
          <Group>
            <IconCategoryPlus size={20} />
            <Text fw={600}>Create New Category</Text>
          </Group>
        }
        centered
        radius="lg"
        size="md"
      >
        <Stack>
          <Alert color="blue" variant="light">
            <Text size="sm">
              This category will be created for{' '}
              <strong>
                {contentType === 'reading' ? 'Reading' : 'Watching'}
              </strong>{' '}
              content.
            </Text>
          </Alert>

          <TextInput
            label="Category Name"
            placeholder="Enter category name"
            required
            {...newCategoryForm.getInputProps('name')}
            {...sharedInputProps()}
            description="e.g., Anime, Manga, Documentary, Series"
          />

          <Select
            label="Category Icon"
            placeholder="Select an icon"
            data={CATEGORY_ICONS}
            {...newCategoryForm.getInputProps('icon')}
            {...sharedInputProps()}
            description="Choose an icon that represents this category"
          />

          <Flex gap={'md'}>
            <AppButton
              variant="default"
              onClick={() => setOpenNewCategoryModal(false)}
              leftSection={<IconX size={16} />}
              fullWidth
            >
              Cancel
            </AppButton>
            <AppButton
              onClick={handleCreateNewCategory}
              loading={isCreating}
              leftSection={<IconCheck size={16} />}
              fullWidth
            >
              Create Category
            </AppButton>
          </Flex>
        </Stack>
      </Modal>

      <ActionModal
        opened={contentCreatedModalOpen}
        onClose={() => setContentCreatedModalOpen(false)}
        title={
          lastSubmitIntent === 'draft'
            ? 'Draft Saved'
            : contentToEdit
              ? 'Content Updated'
              : 'Content Added'
        }
        icon={
          <div className="bg-layout p-2 rounded-full size-14 flex justify-center items-center">
            <IconCheck size={28} color={colors.primary} />
          </div>
        }
        message={
          <p className="text-info text-sm">
            {lastSubmitIntent === 'draft' ? (
              <>Draft saved successfully</>
            ) : contentToEdit ? (
              <>Content updated successfully</>
            ) : (
              <>A new content has been uploaded successfully</>
            )}
          </p>
        }
        primaryButtonText={
          lastSubmitIntent === 'draft'
            ? 'Continue Editing'
            : contentToEdit
              ? 'Done'
              : 'Upload More'
        }
        onPrimaryButtonClick={() => {
          setContentCreatedModalOpen(false)
          form.reset()
          setMediaFile(null)
          setContentImages(createEmptyImageStates())
        }}
        primaryButtonColor={colors.primary}
        secondaryButtonText={
          lastSubmitIntent === 'draft' ? undefined : 'Go To Contents'
        }
        onSecondaryButtonClick={
          lastSubmitIntent === 'draft'
            ? undefined
            : () => {
                navigate({
                  to: '/content',
                  search: (prev) => ({
                    view: prev.view as 'grid',
                    mode: prev.mode as 'reading',
                  }),
                })
              }
        }
      />
    </div>
  )
}

export default NewContent

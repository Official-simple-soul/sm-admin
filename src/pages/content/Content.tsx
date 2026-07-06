import { AppButton } from '@/components/AppButton'
import { EmptyState } from '@/components/EmptyState'
import ActionModal from '@/components/modals/ActionModal'
import PageHeader from '@/components/PageHeader'
import DashboardLayout from '@/layout/DashboardLayout'
import { useAnalytics } from '@/services/analytics.service'
import { useCollection } from '@/services/collection.service'
import { useContent } from '@/services/content.service'
import { colors } from '@/theme/theme'
import type { Content } from '@/types/content.type'
import {
  Card,
  Center,
  Grid,
  Group,
  Paper,
  SegmentedControl,
  Skeleton,
  Text,
} from '@mantine/core'
import { IconGridDots, IconList, IconTrash } from '@tabler/icons-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import React, { startTransition, useState } from 'react'
import ContentCard from './components/ContentCard'
import ContentList from './components/ContentList'

export const ContentPage: React.FC = () => {
  const search = useSearch({
    from: '/content/',
  })

  const viewMode = (search.view ?? 'grid') as 'list' | 'grid'
  const modeType = (search.mode ?? 'reading') as 'reading' | 'watching'

  const { decrementCollectionCount } = useCollection()
  const { decrementAnalyticsCount } = useAnalytics()
  const { content, error, isLoading, deleteContent, isDeleting } = useContent()
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null)

  const navigate = useNavigate({ from: '/content' })
  const route = useNavigate()

  const handleView = (content: Content) => {
    route({ to: `/content/${content.id}` })
  }

  const handleEdit = (content: Content) => {
    // Open edit modal
    console.log('Edit content:', content)
    navigate({ to: '/content/new-content', search: content })
  }

  const handleDelete = () => {
    if (!contentToDelete?.id) return

    const collectionId = contentToDelete.collectionId

    deleteContent(contentToDelete.id, {
      onSuccess: async () => {
        setContentToDelete(null)

        await Promise.all([
          ...(collectionId ? [decrementCollectionCount(collectionId)] : []),
          decrementAnalyticsCount({ field: 'content', amount: 1 }),
        ])
      },
    })
  }

  const updateSearch = (
    updates: Partial<{ view: 'list' | 'grid'; mode: 'reading' | 'watching' }>,
  ) => {
    startTransition(() => {
      navigate({
        search: (prev) => ({
          ...prev,
          ...updates,
        }),
        replace: true,
      })
    })
  }

  const filteredContent = content?.filter((item) => item.mode === modeType)

  if (error) {
    return (
      <Center style={{ height: '50vh' }}>
        <Text c="red">Error loading content: {error.message}</Text>
      </Center>
    )
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Content Library"
        subtitle="Manage all your comics and videos"
        actionLabel="Add New Content"
        onAction={() => navigate({ to: '/content/new-content' })}
      />

      <Paper bg={'transparent'} mb="lg" py="md">
        <Group justify="space-between">
          <SegmentedControl
            value={modeType}
            onChange={(value) =>
              updateSearch({ mode: value as 'reading' | 'watching' })
            }
            data={[
              { label: 'Flex', value: 'reading' },
              { label: 'Movie', value: 'watching' },
            ]}
          />

          <SegmentedControl
            value={viewMode}
            onChange={(value) =>
              updateSearch({ view: value as 'list' | 'grid' })
            }
            data={[
              { label: <IconList size={16} />, value: 'list' },
              { label: <IconGridDots size={16} />, value: 'grid' },
            ]}
          />
        </Group>
      </Paper>

      {isLoading ? (
        <Grid>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid.Col
              key={index}
              span={
                viewMode === 'grid' ? { base: 12, md: 6, lg: 4, xl: 3 } : 12
              }
            >
              {viewMode === 'grid' ? (
                <Card padding="lg" radius="md" withBorder>
                  <Skeleton height={200} mb="md" />
                  <Skeleton height={20} mb="xs" />
                  <Skeleton height={16} mb="md" />
                  <Skeleton height={16} width="70%" />
                </Card>
              ) : (
                <Paper withBorder p="md">
                  <Group>
                    <Skeleton height={60} width={60} radius="md" />
                    <div style={{ flex: 1 }}>
                      <Skeleton height={20} width="60%" mb="xs" />
                      <Skeleton height={16} width="90%" />
                    </div>
                    <Skeleton height={20} width={80} />
                  </Group>
                </Paper>
              )}
            </Grid.Col>
          ))}
        </Grid>
      ) : filteredContent && filteredContent.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredContent.map((item, index) => (
              <ContentCard
                key={index}
                content={item}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={() => setContentToDelete(item)}
              />
            ))}
          </div>
        ) : (
          <ContentList
            content={filteredContent}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(item) => setContentToDelete(item)}
          />
        )
      ) : (
        <Center py="xl">
          <EmptyState
            action={
              <AppButton
                onClick={() => navigate({ to: '/content/new-content' })}
              >
                Add New Content
              </AppButton>
            }
          />
        </Center>
      )}

      <ActionModal
        opened={!!contentToDelete}
        onClose={() => setContentToDelete(null)}
        title={<span className="text-danger">Confirm Delete</span>}
        icon={
          <div className="bg-danger/10 p-2 rounded-full size-14 flex justify-center items-center">
            <IconTrash size={28} color={colors.danger} />
          </div>
        }
        message={
          <p className="text-info text-sm">
            Are you sure you want to delete this content? This action cannot be
            undone.
          </p>
        }
        primaryButtonText={'Delete'}
        onPrimaryButtonClick={() => {
          handleDelete()
        }}
        isPrimaryButtonLoading={isDeleting}
        primaryButtonColor={colors.danger}
        secondaryButtonText="Cancel"
        onSecondaryButtonClick={() => {
          setContentToDelete(null)
        }}
      />
    </DashboardLayout>
  )
}

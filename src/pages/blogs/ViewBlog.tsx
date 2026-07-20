import React, { useState } from 'react'
import {
  Paper,
  Text,
  Group,
  Badge,
  Image,
  ActionIcon,
  Divider,
  Skeleton,
  Center,
} from '@mantine/core'
import {
  IconTrash,
  IconHeart,
  IconMessage,
  IconShare,
  IconCalendar,
  IconUser,
  IconEyeOff,
  IconEye,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import DashboardLayout from '@/layout/DashboardLayout'
import PageHeader from '@/components/PageHeader'
import { AppButton } from '@/components/AppButton'
import ActionModal from '@/components/modals/ActionModal'
import { colors } from '@/theme/theme'
import { useUpdateBlog, useDeleteBlog, useBlog } from '@/services/blog.service'
import { getBlogCoverImage } from '@/types/blog.type'
import { formatDate } from '@/utils/dateUtils'
import { Back } from '@/components/Back'

interface ViewBlog {
  id: string
}

function ViewBlog({ id }: ViewBlog) {
  const { data: blog, isLoading } = useBlog(id)
  const { mutate: updateBlog, isPending: isUpdating } = useUpdateBlog()
  const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog()
  const navigate = useNavigate()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  // const handleEdit = () => {
  //   navigate({ to: `/blogs/edit/${id}` })
  // }

  const handleDelete = () => {
    deleteBlog(id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false)
        navigate({ to: '/blogs' })
      },
    })
  }

  const handleStatusChange = () => {
    updateBlog(
      {
        id,
        data: { isApproved: !blog?.isApproved },
      },
      {
        onSuccess: () => {
          setIsStatusModalOpen(false)
        },
      },
    )
  }

  return (
    <DashboardLayout>
      <div className="pb-8">
        <Group justify="space-between" mb="lg">
          <Back page="blogs" />

          <Group>
            <AppButton
              variant={'outline'}
              color={blog?.isApproved ? colors.danger : colors.primary}
              leftSection={
                blog?.isApproved ? (
                  <IconEyeOff size={16} />
                ) : (
                  <IconEye size={16} />
                )
              }
              onClick={() => setIsStatusModalOpen(true)}
              loading={isUpdating}
            >
              {blog?.isApproved ? 'Take Down' : 'Approve'}
            </AppButton>

            {/* <AppButton
              leftSection={<IconEdit size={16} />}
              onClick={handleEdit}
            >
              Edit Blog
            </AppButton> */}

            <ActionIcon
              variant="outline"
              color="red"
              size="lg"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Group>

        {isLoading ? (
          <BlogDetailSkeleton />
        ) : blog ? (
          <>
            <Paper withBorder p="xl" radius="lg" className="mb-6">
              <Group justify="space-between" align="flex-start" mb="md">
                <div>
                  <Badge
                    color={
                      blog.allowInteractions ? colors.success : colors.danger
                    }
                    variant="light"
                    size="lg"
                    mb="sm"
                  >
                    {blog.allowInteractions
                      ? 'Interaction Allowed'
                      : 'Interaction Blocked'}
                  </Badge>
                </div>

                <Badge
                  color={blog.isApproved ? colors.success : colors.danger}
                  variant="light"
                  size="lg"
                  mb="sm"
                >
                  {blog.isApproved ? 'Approved' : 'Banned'}
                </Badge>
              </Group>

              <Image
                src={getBlogCoverImage(blog)}
                alt="Blog cover"
                radius="md"
                className="mb-6 shadow"
                h={400}
                fallbackSrc="https://placehold.co/800x400?text=Blog+Cover"
              />

              <Text size="md" className="whitespace-pre-wrap">
                {blog.content}
              </Text>

              <Divider my="xl" />

              <Group justify="space-between">
                <Group>
                  <Group gap={4}>
                    <IconHeart size={18} color={colors.danger} />
                    <Text size="sm">{blog.likes?.length ?? 0} likes</Text>
                  </Group>

                  <Group gap={4}>
                    <IconMessage size={18} color={colors.info} />
                    <Text size="sm">{blog.totalComments} comments</Text>
                  </Group>

                  <Group gap={4}>
                    <IconShare size={18} color={colors.success} />
                    <Text size="sm">{blog.shares} shares</Text>
                  </Group>
                </Group>

                <Group>
                  <Group gap={4}>
                    <IconCalendar size={16} color={colors.info} />
                    <Text size="sm">
                      Created: {formatDate(blog.createdAt.toDate())}
                    </Text>
                  </Group>

                  {blog.updatedAt && (
                    <Group gap={4}>
                      <IconCalendar size={16} color={colors.info} />
                      <Text size="sm">
                        Updated: {formatDate(blog.updatedAt.toDate())}
                      </Text>
                    </Group>
                  )}
                </Group>
              </Group>
            </Paper>

            <Paper withBorder p="xl" radius="lg">
              <Text fw={600} size="lg" mb="md">
                Author Information
              </Text>

              <Group>
                <Image
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  w={60}
                  h={60}
                  radius="md"
                  fallbackSrc="https://placehold.co/60x60?text=Avatar"
                />

                <div>
                  <Text fw={600}>{blog.author.name}</Text>
                  {blog.author.username && (
                    <Text size="sm" c="dimmed">
                      @{blog.author.username}
                    </Text>
                  )}
                  <Group gap={4} mt={4}>
                    <IconUser size={14} />
                    <Text size="sm">Author ID: {blog.author.id}</Text>
                  </Group>
                </div>
              </Group>
            </Paper>
          </>
        ) : (
          <Center py="xl">
            <Text>Blog not found</Text>
          </Center>
        )}
      </div>

      <ActionModal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={<span className="text-danger">Confirm Delete</span>}
        icon={
          <div className="bg-danger/10 p-2 rounded-full size-14 flex justify-center items-center">
            <IconTrash size={28} color={colors.danger} />
          </div>
        }
        message={
          <p className="text-info text-sm">
            Are you sure you want to delete this blog? This action cannot be
            undone.
          </p>
        }
        primaryButtonText={'Delete'}
        onPrimaryButtonClick={handleDelete}
        isPrimaryButtonLoading={isDeleting}
        primaryButtonColor={colors.danger}
        secondaryButtonText="Cancel"
        onSecondaryButtonClick={() => setIsDeleteModalOpen(false)}
      />

      <ActionModal
        opened={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={
          blog?.isApproved ? (
            <span className="text-danger">Take Down Blog</span>
          ) : (
            <span className="">Approve Blog</span>
          )
        }
        icon={
          blog?.isApproved ? (
            <div className="bg-danger/10 p-2 rounded-full size-14 flex justify-center items-center">
              <IconEyeOff size={28} color={colors.danger} />
            </div>
          ) : (
            <div className="bg-primary/10 p-2 rounded-full size-14 flex justify-center items-center">
              <IconEye size={28} color={colors.primary} />
            </div>
          )
        }
        message={
          blog?.isApproved
            ? 'This will hide the blog from users and disable interactions.'
            : 'This will make the blog visible to users and allow interactions.'
        }
        primaryButtonText={blog?.isApproved ? 'Take Down' : 'Approve'}
        onPrimaryButtonClick={handleStatusChange}
        isPrimaryButtonLoading={isLoading}
        primaryButtonColor={blog?.isApproved ? colors.danger : colors.primary}
        secondaryButtonText="Cancel"
        onSecondaryButtonClick={() => setIsStatusModalOpen(false)}
      />
    </DashboardLayout>
  )
}

// Skeleton loader for blog detail
const BlogDetailSkeleton: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Blog Details"
        subtitle="View and manage this blog post"
      />

      <Paper withBorder p="xl" radius="lg" className="mb-6">
        <Skeleton height={28} width={100} mb="md" />
        <Skeleton height={32} width="80%" mb="xl" />
        <Skeleton height={300} radius="md" mb="xl" />
        <Skeleton height={120} mb="xl" />

        <Divider my="xl" />

        <Group justify="space-between">
          <Group>
            <Skeleton height={20} width={80} />
            <Skeleton height={20} width={100} />
            <Skeleton height={20} width={80} />
          </Group>
          <Group>
            <Skeleton height={20} width={120} />
            <Skeleton height={20} width={120} />
          </Group>
        </Group>
      </Paper>

      <Paper withBorder p="xl" radius="lg">
        <Skeleton height={24} width={200} mb="md" />
        <Group>
          <Skeleton height={60} width={60} radius="md" />
          <div>
            <Skeleton height={20} width={120} mb="xs" />
            <Skeleton height={16} width={80} />
            <Skeleton height={16} width={140} mt="xs" />
          </div>
        </Group>
      </Paper>
    </>
  )
}

export default ViewBlog

import { colors } from '@/theme/theme'
import type { Content } from '@/types/content.type'
import {
  ActionIcon,
  Badge,
  Card,
  Flex,
  Group,
  Image,
  Menu,
  Progress,
  Text,
} from '@mantine/core'
import {
  IconBook,
  IconCrown,
  IconDotsVertical,
  IconEdit,
  IconFileAnalytics,
  IconFreeRights,
  IconTrash,
} from '@tabler/icons-react'

interface ContentCardProps {
  content: Content
  isLoading?: boolean
  onEdit: (content: Content) => void
  onDelete: (content: Content) => void
  onView: (content: Content) => void
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onEdit,
  onDelete,
  onView,
}) => {
  const completionRate =
    content.totalViews > 0
      ? (content.totalCompletions / content.totalViews) * 100
      : 0

  return (
    <Card
      padding="xs"
      radius="lg"
      withBorder
      className="h-ful bg-background/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
    >
      <Card.Section className="relative mb-4">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={content.thumbnail}
            h={350}
            alt={content.title}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fallbackSrc="https://placehold.co/600x700?text=Cover+Image"
          />
          <Badge
            color={colors.primary}
            variant="filled"
            className="absolute top-2 right-2 shadow-md! shadow-black"
            leftSection={
              content.package === 'premium' ? (
                <IconCrown size={12} />
              ) : (
                <IconFreeRights size={12} />
              )
            }
            radius={'sm'}
          >
            <p className="text-[10px] capitalize">{content.package}</p>
          </Badge>
          <div
            className={`absolute bottom-0 left-0 w-full px-3 py-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs flex justify-between items-center`}
          >
            <span className="capitalize">{content.status}</span>
            <span className="flex items-center">
              <IconBook size={12} className="mr-1" />
              {content.length}
              {content.mode === 'reading' ? 'p' : 'm'}
            </span>
          </div>
        </div>
      </Card.Section>

      <div className="flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <Text
            fw={700}
            size="lg"
            lineClamp={1}
            className="text-text group-hover:text-primary transition-colors capitalize"
          >
            {content.title}
          </Text>
        </div>
        <div className="my-3">
          <Group justify="space-between" className="mb-1">
            <Text size="xs" c="dimmed">
              <span className="font-semibold text-text mr-1">
                {content.totalViews}
              </span>
              reads
            </Text>
            <Text size="xs" c="dimmed">
              <span className="font-semibold text-text mr-1">
                {content.totalCompletions}
              </span>
              completed
            </Text>
          </Group>
          <Progress
            value={completionRate}
            size="sm"
            radius="xl"
            color={
              completionRate >= 50
                ? colors.success
                : completionRate >= 25
                  ? colors.warning
                  : colors.danger
            }
            className="mb-1"
          />
          <Text size="xs" c="dimmed" ta="center">
            {completionRate.toFixed(1)}% completion rate
          </Text>
        </div>

        <Flex justify={'space-between'} align={'center'} className="mt-3">
          <p className="text-xs text-text px-2 py-1 rounded-md transition-colors">
            {content.uploadedAt
              ? content.uploadedAt.toDate().toLocaleDateString()
              : ''}
          </p>
          <Menu withinPortal position="top-end" shadow="sm">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="red"
                size="lg"
                className="hover:bg-gray-100"
              >
                <IconDotsVertical size={18} color={colors.primary} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={16} />}
                className="text-sm"
                onClick={() => onEdit(content)}
              >
                Edit Content
              </Menu.Item>
              <Menu.Item
                leftSection={<IconFileAnalytics size={16} />}
                className="text-sm"
                onClick={() => onView(content)}
              >
                View Content
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                className="text-sm"
                onClick={() => onDelete(content)}
              >
                Delete Content
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </div>
    </Card>
  )
}

export default ContentCard

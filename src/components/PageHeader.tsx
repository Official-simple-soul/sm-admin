import { Group } from '@mantine/core'
import { AppButton } from './AppButton'
import { Back } from './Back'

interface PageHeaderProps {
  title?: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: React.ReactNode
  secondaryActionLabel?: string
  secondaryOnAction?: () => void
  secondaryActionIcon?: React.ReactNode
  secondaryLoading?: boolean
  page?: string
  loading?: boolean
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  secondaryOnAction,
  secondaryActionIcon,
  secondaryLoading = false,
  page = null,
  loading = false,
}) => {
  return (
    <Group justify="space-between" mb="lg">
      {page ? (
        <Back page={page} />
      ) : (
        <div>
          <p className="text-text md:text-2xl font-medium">{title}</p>
          {subtitle && (
            <p className="text-info text-sm md:text-base">{subtitle}</p>
          )}
        </div>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <Group gap="sm">
          {secondaryActionLabel && secondaryOnAction && (
            <AppButton
              variant="light"
              color="gray"
              onClick={secondaryOnAction}
              leftSection={secondaryActionIcon}
              loading={secondaryLoading}
            >
              {secondaryActionLabel}
            </AppButton>
          )}
          {actionLabel && onAction && (
            <AppButton
              onClick={onAction}
              leftSection={actionIcon}
              loading={loading}
            >
              {actionLabel}
            </AppButton>
          )}
        </Group>
      )}
    </Group>
  )
}

export default PageHeader

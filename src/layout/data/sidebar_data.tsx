import { roles } from '@/config/config'
import {
  IconCategory,
  IconContainer,
  IconDashboard,
  IconFolders,
  IconPaperBag,
  IconPencil,
  IconUsers,
} from '@tabler/icons-react'

export const links = [
  {
    icon: <IconDashboard size={20} />,
    label: 'Dashboard',
    route: '/dashboard',
    allowedRoles: roles.dashboard,
  },
  {
    icon: <IconContainer size={20} />,
    label: 'Content Management',
    route: '/content',
    allowedRoles: roles.content,
  },
  {
    icon: <IconPencil size={20} />,
    label: 'Authors',
    route: '/authors',
    allowedRoles: roles.authors,
  },
  {
    icon: <IconFolders size={20} />,
    label: 'Collections',
    route: '/collections',
    allowedRoles: roles.collections,
  },
  {
    icon: <IconCategory size={20} />,
    label: 'Categories',
    route: '/categories',
    allowedRoles: roles.categories,
  },
  {
    icon: <IconUsers size={20} />,
    label: 'Employees',
    route: '/employee',
    allowedRoles: roles.employee,
  },
  {
    icon: <IconUsers size={20} />,
    label: 'Users Management',
    route: '/users',
    allowedRoles: roles.users,
  },
  {
    icon: <IconPaperBag size={20} />,
    label: 'Blogs Management',
    route: '/blogs',
    allowedRoles: roles.blogs,
  },
]

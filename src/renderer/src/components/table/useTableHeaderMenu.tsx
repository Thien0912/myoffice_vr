import { ArrowLeftToLine, ArrowRightToLine, XCircle } from 'lucide-react'
import { ReactNode, useMemo } from 'react'

export interface HeaderMenuItem {
  label: string
  icon?: ReactNode
  onClick?: () => void
}

interface UseTableHeaderMenuProps {
  onPinColumn: (pin: 'left' | 'right' | undefined) => void
  extraItems?: HeaderMenuItem[]
}

export const useTableHeaderMenu = ({
  onPinColumn,
  extraItems = []
}: UseTableHeaderMenuProps): HeaderMenuItem[] => {
  const menuItems = useMemo(() => {
    const defaultItems: HeaderMenuItem[] = [
      {
        label: 'Ghim sang trái',
        icon: <ArrowLeftToLine size={16} />,
        onClick: () => onPinColumn('left')
      },
      {
        label: 'Ghim sang phải',
        icon: <ArrowRightToLine size={16} />,
        onClick: () => onPinColumn('right')
      },
      {
        label: 'Bỏ ghim',
        icon: <XCircle size={16} />,
        onClick: () => onPinColumn(undefined)
      }
    ]

    if (extraItems.length > 0) {
      return [...defaultItems, { label: 'separator' }, ...extraItems]
    }

    return defaultItems
  }, [onPinColumn, extraItems])

  return menuItems
}

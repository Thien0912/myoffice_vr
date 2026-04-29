// utils/useCurrentStore.ts
import {
  useVanbandenStore,
  useVanbandiStore,
  useVanbandendonviStore,
  useVanbannoiboStore,
  useVanbandidonviStore,
  useVanbandaxoaStore
} from '@renderer/store/useVanbanStore'

import { useHopdongStore } from '@renderer/store/useProfileStore'
import { useProposeStore } from '@renderer/store/useProposeStore'

import { useLocation } from 'react-router-dom'

export function useCurrentStore(): any {
  const location = useLocation()

  if (location.pathname.includes('vanbandidonvi')) return useVanbandidonviStore()
  if (location.pathname.includes('vanbandendonvi')) return useVanbandendonviStore()
  if (location.pathname.includes('vanbandi')) return useVanbandiStore()
  if (location.pathname.includes('vanbanden')) return useVanbandenStore()
  if (location.pathname.includes('vanbannoibo')) return useVanbannoiboStore()
  if (location.pathname.includes('vanbandaxoa')) return useVanbandaxoaStore()
  if (location.pathname.includes('hop-dong')) return useHopdongStore()
  if (location.pathname.includes('de-xuat')) return useProposeStore()

  return useVanbandenStore()
}

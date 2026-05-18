// 20 predefined colors for roles - Tailwind classes
export const ROLE_COLORS = [
  { id: 'red', bgClass: 'bg-red-500', textClass: 'text-red-500', bgLightClass: 'bg-red-50 dark:bg-red-900/20', borderClass: 'bg-red-500', hex: '#EF4444', name: 'Đỏ' },
  { id: 'orange', bgClass: 'bg-orange-500', textClass: 'text-orange-500', bgLightClass: 'bg-orange-50 dark:bg-orange-900/20', borderClass: 'bg-orange-500', hex: '#F97316', name: 'Cam' },
  { id: 'amber', bgClass: 'bg-amber-500', textClass: 'text-amber-500', bgLightClass: 'bg-amber-50 dark:bg-amber-900/20', borderClass: 'bg-amber-500', hex: '#F59E0B', name: 'Vàng amber' },
  { id: 'yellow', bgClass: 'bg-yellow-500', textClass: 'text-yellow-500', bgLightClass: 'bg-yellow-50 dark:bg-yellow-900/20', borderClass: 'bg-yellow-500', hex: '#EAB308', name: 'Vàng' },
  { id: 'lime', bgClass: 'bg-lime-500', textClass: 'text-lime-500', bgLightClass: 'bg-lime-50 dark:bg-lime-900/20', borderClass: 'bg-lime-500', hex: '#84CC16', name: 'Xanh lime' },
  { id: 'green', bgClass: 'bg-green-500', textClass: 'text-green-500', bgLightClass: 'bg-green-50 dark:bg-green-900/20', borderClass: 'bg-green-500', hex: '#22C55E', name: 'Xanh lá' },
  { id: 'emerald', bgClass: 'bg-emerald-500', textClass: 'text-emerald-500', bgLightClass: 'bg-emerald-50 dark:bg-emerald-900/20', borderClass: 'bg-emerald-500', hex: '#10B981', name: 'Xanh emerald' },
  { id: 'teal', bgClass: 'bg-teal-500', textClass: 'text-teal-500', bgLightClass: 'bg-teal-50 dark:bg-teal-900/20', borderClass: 'bg-teal-500', hex: '#14B8A6', name: 'Xanh teal' },
  { id: 'cyan', bgClass: 'bg-cyan-500', textClass: 'text-cyan-500', bgLightClass: 'bg-cyan-50 dark:bg-cyan-900/20', borderClass: 'bg-cyan-500', hex: '#06B6D4', name: 'Xanh cyan' },
  { id: 'sky', bgClass: 'bg-sky-500', textClass: 'text-sky-500', bgLightClass: 'bg-sky-50 dark:bg-sky-900/20', borderClass: 'bg-sky-500', hex: '#0EA5E9', name: 'Xanh sky' },
  { id: 'blue', bgClass: 'bg-blue-500', textClass: 'text-blue-500', bgLightClass: 'bg-blue-50 dark:bg-blue-900/20', borderClass: 'bg-blue-500', hex: '#3B82F6', name: 'Xanh dương' },
  { id: 'indigo', bgClass: 'bg-indigo-500', textClass: 'text-indigo-500', bgLightClass: 'bg-indigo-50 dark:bg-indigo-900/20', borderClass: 'bg-indigo-500', hex: '#6366F1', name: 'Xanh indigo' },
  { id: 'violet', bgClass: 'bg-violet-500', textClass: 'text-violet-500', bgLightClass: 'bg-violet-50 dark:bg-violet-900/20', borderClass: 'bg-violet-500', hex: '#8B5CF6', name: 'Tím violet' },
  { id: 'purple', bgClass: 'bg-purple-500', textClass: 'text-purple-500', bgLightClass: 'bg-purple-50 dark:bg-purple-900/20', borderClass: 'bg-purple-500', hex: '#A855F7', name: 'Tím' },
  { id: 'fuchsia', bgClass: 'bg-fuchsia-500', textClass: 'text-fuchsia-500', bgLightClass: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', borderClass: 'bg-fuchsia-500', hex: '#D946EF', name: 'Hồng fuchsia' },
  { id: 'pink', bgClass: 'bg-pink-500', textClass: 'text-pink-500', bgLightClass: 'bg-pink-50 dark:bg-pink-900/20', borderClass: 'bg-pink-500', hex: '#EC4899', name: 'Hồng' },
  { id: 'rose', bgClass: 'bg-rose-500', textClass: 'text-rose-500', bgLightClass: 'bg-rose-50 dark:bg-rose-900/20', borderClass: 'bg-rose-500', hex: '#F43F5E', name: 'Hồng rose' },
  { id: 'slate', bgClass: 'bg-slate-500', textClass: 'text-slate-500', bgLightClass: 'bg-slate-50 dark:bg-slate-900/20', borderClass: 'bg-slate-500', hex: '#64748B', name: 'Xám slate' },
  { id: 'zinc', bgClass: 'bg-zinc-500', textClass: 'text-zinc-500', bgLightClass: 'bg-zinc-50 dark:bg-zinc-900/20', borderClass: 'bg-zinc-500', hex: '#71717A', name: 'Xám zinc' },
  { id: 'stone', bgClass: 'bg-stone-500', textClass: 'text-stone-500', bgLightClass: 'bg-stone-50 dark:bg-stone-900/20', borderClass: 'bg-stone-500', hex: '#78716C', name: 'Xám stone' }
] as const

export type RoleColor = typeof ROLE_COLORS[number]

// Get color by id
export const getRoleColorById = (id: string): RoleColor | undefined => {
  return ROLE_COLORS.find(color => color.id === id)
}

// Get color by hex
export const getRoleColorByHex = (hex: string): RoleColor | undefined => {
  return ROLE_COLORS.find(color => color.hex === hex)
}

// Get color by bgClass
export const getRoleColorByBgClass = (bgClass: string): RoleColor | undefined => {
  return ROLE_COLORS.find(color => color.bgClass === bgClass)
}

// Get used color ids from roles
export const getUsedColorIds = (roles: any[], excludeRoleId?: string | number): string[] => {
  return roles
    .filter((r: any) => excludeRoleId ? r.ql_vai_tro_id !== excludeRoleId : true)
    .map((r: any) => {
      // Try to find color by dotColor or bgClass
      const color = getRoleColorByBgClass(r.dotColor)
      return color?.id
    })
    .filter(Boolean) as string[]
}

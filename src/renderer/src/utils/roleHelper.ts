/**
 * Helper function to get active role ID from user object
 * Used as a dependency in React Query queryKey to trigger refetch on role change
 */
export const getActiveRoleId = (user: any): string | undefined => {
  if (!user?.vai_tro || !Array.isArray(user.vai_tro)) {
    return undefined
  }
  const activeRole = user.vai_tro.find((role: any) => String(role.is_active ?? '0') === '1')
  return activeRole?.ql_vai_tro_id ? String(activeRole.ql_vai_tro_id) : undefined
}

/**
 * Get role dependency for query keys
 * When active role changes, this value changes → query key changes → React Query refetches
 */
export const getRoleDependency = (user: any): string | undefined => {
  return getActiveRoleId(user)
}

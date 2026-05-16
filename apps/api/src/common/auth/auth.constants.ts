export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

/** Stable role ids used by auth signup (`auth.service.resolveRole`). */
export const ROLE_ID_USER = 1;
export const ROLE_ID_OWNER = 2;

export type CanonicalRole = 'USER' | 'OWNER';

/** Map JWT user to guard role codes; DB `role_name` may be localized. */
export function resolveCanonicalRole(user: {
  roleId: number;
  roleName: string;
}): CanonicalRole | null {
  if (user.roleId === ROLE_ID_USER) {
    return 'USER';
  }
  if (user.roleId === ROLE_ID_OWNER) {
    return 'OWNER';
  }

  const normalized = user.roleName.trim().toUpperCase();
  if (normalized === 'USER' || normalized === 'OWNER') {
    return normalized;
  }

  return null;
}

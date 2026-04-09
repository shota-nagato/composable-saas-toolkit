const SEED_DATE = new Date('2026-04-01T00:00:00.000Z')

export const defaultOrganizations = [
  {
    id: 'org-alpha',
    name: 'Alpha Workspace',
    slug: 'alpha',
    createdAt: SEED_DATE,
  },
  {
    id: 'org-beta',
    name: 'Beta Workspace',
    slug: 'beta',
    createdAt: SEED_DATE,
  },
]

export const defaultMembers = [
  {
    id: 'member-alpha',
    organizationId: 'org-alpha',
    userId: 'user-seed',
    role: 'owner',
    createdAt: SEED_DATE,
  },
  {
    id: 'member-beta',
    organizationId: 'org-beta',
    userId: 'user-seed',
    role: 'owner',
    createdAt: SEED_DATE,
  },
]

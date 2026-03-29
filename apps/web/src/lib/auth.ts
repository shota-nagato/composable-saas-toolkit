import { createAuthClient } from '@toolkit/auth/client'

const baseURL = import.meta.env.VITE_API_URL ?? window.location.origin

export const authClient = createAuthClient({ baseURL })

import { createAuthClient as createBetterAuthClient } from 'better-auth/react'
import { BASE_PATH } from '../constants'

export interface AuthClientConfig {
  baseURL: string
}

/**
 * ブラウザ用の認証クライアントを作成
 */
export const createAuthClient = ({ baseURL }: AuthClientConfig) => {
  return createBetterAuthClient({
    baseURL,
    basePath: BASE_PATH,
    fetchOptions: { credentials: 'include' },
  })
}

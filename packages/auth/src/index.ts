// エラーハンドリング（クライアント・サーバー共通）
export type { AuthError, AuthErrorCode, AuthResult } from './errors'
export {
  AUTH_ERROR_CODE,
  getAuthErrorMessage,
  isAuthError,
  isAuthErrorCode,
} from './errors'
// ミドルウェア型
export type { AuthVariables } from './middleware'
// サーバー型（re-export for convenience）
export type {
  Auth,
  AuthSession,
  AuthSessionData,
  AuthUser,
  CreateAuthParams,
} from './server'
export type { AuthBindings } from './server/types'

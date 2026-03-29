/**
 * BetterAuth エラーコード定数
 *
 * @see https://github.com/better-auth/better-auth/blob/main/packages/core/src/error/codes.ts
 */
export const AUTH_ERROR_CODE = {
  INVALID_EMAIL_OR_PASSWORD: 'INVALID_EMAIL_OR_PASSWORD',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  FAILED_TO_CREATE_USER: 'FAILED_TO_CREATE_USER',
  FAILED_TO_UPDATE_USER: 'FAILED_TO_UPDATE_USER',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_NOT_FRESH: 'SESSION_NOT_FRESH',
  FAILED_TO_CREATE_SESSION: 'FAILED_TO_CREATE_SESSION',
  FAILED_TO_GET_SESSION: 'FAILED_TO_GET_SESSION',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'CREDENTIAL_ACCOUNT_NOT_FOUND',
  SOCIAL_ACCOUNT_ALREADY_LINKED: 'SOCIAL_ACCOUNT_ALREADY_LINKED',
  LINKED_ACCOUNT_ALREADY_EXISTS: 'LINKED_ACCOUNT_ALREADY_EXISTS',
  FAILED_TO_UNLINK_LAST_ACCOUNT: 'FAILED_TO_UNLINK_LAST_ACCOUNT',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  PASSWORD_TOO_LONG: 'PASSWORD_TOO_LONG',
  USER_ALREADY_HAS_PASSWORD: 'USER_ALREADY_HAS_PASSWORD',
  VERIFICATION_EMAIL_NOT_ENABLED: 'VERIFICATION_EMAIL_NOT_ENABLED',
  PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
  INVALID_ORIGIN: 'INVALID_ORIGIN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODE)[keyof typeof AUTH_ERROR_CODE]

const AUTH_ERROR_MESSAGES: Partial<Record<AuthErrorCode, string>> = {
  [AUTH_ERROR_CODE.INVALID_EMAIL_OR_PASSWORD]:
    'メールアドレスまたはパスワードが間違っています',
  [AUTH_ERROR_CODE.INVALID_PASSWORD]: 'パスワードが間違っています',
  [AUTH_ERROR_CODE.INVALID_EMAIL]: 'メールアドレスの形式が正しくありません',
  [AUTH_ERROR_CODE.INVALID_TOKEN]: 'トークンが無効または期限切れです',
  [AUTH_ERROR_CODE.EMAIL_NOT_VERIFIED]:
    'メールアドレスが認証されていません。メールを確認してください',
  [AUTH_ERROR_CODE.EMAIL_ALREADY_VERIFIED]:
    'メールアドレスは既に認証されています',
  [AUTH_ERROR_CODE.USER_NOT_FOUND]: 'ユーザーが見つかりません',
  [AUTH_ERROR_CODE.USER_ALREADY_EXISTS]:
    'このメールアドレスは既に登録されています',
  [AUTH_ERROR_CODE.SESSION_EXPIRED]:
    'セッションが期限切れです。再度ログインしてください',
  [AUTH_ERROR_CODE.SESSION_NOT_FRESH]:
    'この操作にはセキュリティのため再認証が必要です',
  [AUTH_ERROR_CODE.SOCIAL_ACCOUNT_ALREADY_LINKED]:
    'このソーシャルアカウントは既に別のアカウントに紐付けられています',
  [AUTH_ERROR_CODE.FAILED_TO_UNLINK_LAST_ACCOUNT]:
    '最後のアカウント連携を解除することはできません',
  [AUTH_ERROR_CODE.PASSWORD_TOO_SHORT]: 'パスワードが短すぎます',
  [AUTH_ERROR_CODE.PASSWORD_TOO_LONG]: 'パスワードが長すぎます',
}

const DEFAULT_ERROR_MESSAGE = '予期しないエラーが発生しました'

export function getAuthErrorMessage(
  code: string | undefined,
  fallback?: string,
): string {
  if (code === undefined) {
    return fallback ?? DEFAULT_ERROR_MESSAGE
  }
  const message = AUTH_ERROR_MESSAGES[code as AuthErrorCode]
  return message ?? fallback ?? DEFAULT_ERROR_MESSAGE
}

export interface AuthError {
  status?: number
  message?: string
  code?: string
}

export interface AuthResult<T = unknown> {
  data?: T
  error: AuthError | null
}

export function isAuthError<T>(
  result: AuthResult<T> | null | undefined,
): result is AuthResult<T> & { error: AuthError } {
  return result?.error !== null && result?.error !== undefined
}

export function isAuthErrorCode<T>(
  result: AuthResult<T> | null | undefined,
  code: AuthErrorCode,
): boolean {
  return isAuthError(result) && result.error.code === code
}

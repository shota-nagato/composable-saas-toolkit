import { randomBytes, scrypt as scryptCb } from 'node:crypto'

const SEED_DATE = new Date('2026-04-01T00:00:00.000Z')

/**
 * better-auth 互換のパスワードハッシュを生成
 * フォーマット: `{salt}:{scryptKey}` (hex)
 * パラメータ: N=16384, r=16, p=1, dkLen=64
 */
function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  return new Promise((resolve, reject) => {
    scryptCb(
      password.normalize('NFKC'),
      salt,
      64,
      { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
      (err, key) => {
        if (err) return reject(err)
        resolve(`${salt}:${key.toString('hex')}`)
      },
    )
  })
}

export const defaultUser = {
  id: 'user-seed',
  name: 'Seed User',
  email: 'seed@example.com',
  emailVerified: false,
  createdAt: SEED_DATE,
  updatedAt: SEED_DATE,
}

export async function createDefaultAccount() {
  const password = await hashPassword('password123')
  return {
    id: 'account-seed',
    accountId: 'user-seed',
    providerId: 'credential',
    userId: 'user-seed',
    password,
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  }
}

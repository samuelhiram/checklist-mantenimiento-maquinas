import { randomBytes, scrypt as nodeScrypt, timingSafeEqual, createHash } from 'crypto'

const SCRYPT_KEY_LENGTH = 64

async function scrypt(password: string, salt: string, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(password, salt, keyLength, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }

      resolve(Buffer.from(derivedKey))
    })
  })
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scrypt(password, salt, SCRYPT_KEY_LENGTH)
  return `scrypt$${salt}$${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, expectedHash] = passwordHash.split('$')
  if (algorithm !== 'scrypt' || !salt || !expectedHash) {
    return false
  }

  const derivedKey = await scrypt(password, salt, SCRYPT_KEY_LENGTH)
  const expectedBuffer = Buffer.from(expectedHash, 'hex')

  if (derivedKey.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(derivedKey, expectedBuffer)
}

export function generateSessionToken() {
  return randomBytes(32).toString('base64url')
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

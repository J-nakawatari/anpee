import { nextCsrf } from 'next-csrf'

const { csrf, setup } = nextCsrf({
  httpOnly: true,
  secret: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  tokenKey: 'csrf-token',
  cookieName: 'csrf-token',
  skipCheck: process.env.NODE_ENV === 'development' ? 
    (req) => req.url?.startsWith('/_next') || false : 
    undefined,
})

export { csrf, setup }
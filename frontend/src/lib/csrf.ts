import { nextCsrf } from 'next-csrf'

const { csrf, setup } = nextCsrf({
  secret: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
})

export { csrf, setup }
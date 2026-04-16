export type UserRole = 'head_admin' | 'financier' | 'admin'

export interface AuthUser {
  id: string
  email: string | undefined
}

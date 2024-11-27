import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.VITE_PUBLIC_POCKETBASE_URL)

export const authStore = pb.authStore

export type AuthModel = {
  id: string
  name?: string
  avatar?: string
  email: string
  username: string
}

export const getCurrentUser = () => pb.authStore.model as AuthModel | null

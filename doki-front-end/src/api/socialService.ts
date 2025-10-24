import { request } from './gateway.ts'

export default {
  followUser: async (userId: number) => await request<void>('/social/follow', {
    method: 'GET',
    data: { userId }
  }),
}
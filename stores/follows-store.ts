import { create } from "zustand"

interface FollowUser {
  nickname: string
  user_id: number
}

interface FollowsState {
  follows: FollowUser[]
  setFollows: (follows: FollowUser[]) => void
  addFollow: (user: FollowUser) => void
  removeFollow: (userId: number) => void
  clearFollows: () => void
}

export const useFollowsStore = create<FollowsState>((set) => ({
  follows: [],

  setFollows: (follows) => {
    console.log("[v0] Setting follows in store:", follows)
    set({ follows })
  },

  addFollow: (user) => {
    console.log("[v0] Adding follow to store:", user)
    set((state) => ({
      follows: [...state.follows, user],
    }))
  },

  removeFollow: (userId) => {
    console.log("[v0] Removing follow from store:", userId)
    set((state) => ({
      follows: state.follows.filter((user) => user.user_id !== userId),
    }))
  },

  clearFollows: () => set({ follows: [] }),
}))

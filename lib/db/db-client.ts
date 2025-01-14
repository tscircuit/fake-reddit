import { createStore, type StoreApi } from "zustand/vanilla"
import { immer } from "zustand/middleware/immer"
import { hoist, type HoistedStoreApi } from "zustand-hoist"

import { databaseSchema, type DatabaseSchema, type Thing, type Post } from "./schema.ts"
import { combine } from "zustand/middleware"

export const createDatabase = () => {
  return hoist(createStore(initializer))
}

export type DbClient = ReturnType<typeof createDatabase>

const initializer = combine(databaseSchema.parse({}), (set, get) => ({
  addThing: (thing: Omit<Thing, "thing_id">) => {
    set((state) => ({
      things: [
        ...state.things,
        { ...thing, thing_id: state.idCounter.toString() },
      ],
      idCounter: state.idCounter + 1,
    }))
  },
  addPost: (post: Omit<Post, "id" | "name">) => {
    set((state) => {
      const postId = `t3_${state.idCounter}`
      return {
        posts: [
          ...(state.posts || []),
          { 
            ...post,
            id: postId,
            name: postId,
          },
        ],
        idCounter: state.idCounter + 1,
      }
    })
  },
  getPosts: (options?: { 
    after?: string;
    before?: string;
    limit?: number;
    subreddit?: string;
  }) => {
    const state = get()
    // Always return array, even if empty
    const allPosts = state.posts || []
    
    // Return all posts if no options
    if (!options) return allPosts
    
    let filteredPosts = allPosts
    if (options.subreddit) {
      filteredPosts = filteredPosts.filter(p => p.subreddit === options.subreddit)
    }

    let startIndex = 0
    if (options.after) {
      startIndex = filteredPosts.findIndex(p => p.name === options.after) + 1
    } else if (options.before) {
      startIndex = Math.max(0, filteredPosts.findIndex(p => p.name === options.before) - (options.limit || 25))
    }

    return filteredPosts.slice(startIndex, Math.min(startIndex + (options.limit || 25), filteredPosts.length))
  },
}))

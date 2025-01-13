import { createStore, type StoreApi } from "zustand/vanilla"
import { immer } from "zustand/middleware/immer"
import { hoist, type HoistedStoreApi } from "zustand-hoist"

import { databaseSchema, type DatabaseSchema, type Thing, type Post } from "./schema.ts"
import { combine } from "zustand/middleware"

export const createDatabase = () => {
  return hoist(createStore(initializer))
}

export type DbClient = ReturnType<typeof createDatabase>

const initializer = combine(databaseSchema.parse({}), (set) => ({
  addThing: (thing: Omit<Thing, "thing_id">) => {
    set((state) => ({
      things: [
        ...state.things,
        { ...thing, thing_id: state.idCounter.toString() },
      ],
      idCounter: state.idCounter + 1,
    }))
  },
  addPost: (post: Omit<Post, "post_id" | "created_at">) => {
    set((state) => ({
      posts: [
        ...state.posts,
        {
          ...post,
          post_id: state.idCounter.toString(),
          created_at: new Date().toISOString(),
        },
      ],
      idCounter: state.idCounter + 1,
    }))
  },
}))

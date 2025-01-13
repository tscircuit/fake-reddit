import { getTestServer } from "../../fixtures/get-test-server"
import { test, expect } from "bun:test"

test("create and list posts", async () => {
  const { axios } = await getTestServer()

  // Create a new post
  const createResponse = await axios.post("/posts/submit", {
    title: "Test Post",
    body: "This is a test post body",
    url: "https://example.com"
  })

  expect(createResponse.data.ok).toBe(true)
  expect(createResponse.data.post_id).toBeDefined()

  // Verify post appears in list
  const { data } = await axios.get("/posts/list")
  expect(data.posts).toHaveLength(1)
  expect(data.posts[0]).toMatchObject({
    title: "Test Post",
    body: "This is a test post body",
    url: "https://example.com"
  })
})

test("create post with minimal fields", async () => {
  const { axios } = await getTestServer()

  // Create post with only required title
  const createResponse = await axios.post("/posts/submit", {
    title: "Minimal Post"
  })

  expect(createResponse.data.ok).toBe(true)
  expect(createResponse.data.post_id).toBeDefined()

  // Verify post in list
  const { data } = await axios.get("/posts/list")
  const createdPost = data.posts.find((p: { title: string; body?: string; url?: string }) => p.title === "Minimal Post")
  expect(createdPost).toBeDefined()
  expect(createdPost?.body).toBeUndefined()
  expect(createdPost?.url).toBeUndefined()
})

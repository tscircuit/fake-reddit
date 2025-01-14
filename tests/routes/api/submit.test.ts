import { getTestServer } from "tests/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("submit a post", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/submit", {
    sr: "test",
    title: "Test Post",
    text: "Test Content",
    kind: "self",
  })

  expect(response.data.json.errors).toHaveLength(0)
  expect(response.data.json.data).toBeDefined()
  expect(response.data.json.data.name).toMatch(/^t3_\d+$/)

  // Verify post appears in listing
  const listResponse = await axios.get("/api/info")
  const posts = listResponse.data.data.children
  expect(posts).toHaveLength(1)
  expect(posts[0].data.title).toBe("Test Post")
  expect(posts[0].data.selftext).toBe("Test Content")
  expect(posts[0].data.subreddit).toBe("test")
})

test("submit with validation", async () => {
  const { axios } = await getTestServer()

  // Test required fields
  const invalidResponse = await axios.post("/api/submit", {
    title: "Missing subreddit",
  })
  expect(invalidResponse.data.json.errors).toHaveLength(1)
  expect(invalidResponse.data.json.errors[0][0]).toBe("subreddit")
  expect(invalidResponse.data.json.data).toBeDefined()
  expect(invalidResponse.data.json.data.url).toBe("")

  // Test optional URL for link posts
  const linkResponse = await axios.post("/api/submit", {
    sr: "test",
    title: "Link Post",
    kind: "link",
    url: "https://example.com",
  })
  expect(linkResponse.data.json.errors).toHaveLength(0)
  expect(linkResponse.data.json.data.name).toMatch(/^t3_\d+$/)
})

test("submit a snippet post", async () => {
  const { axios } = await getTestServer()

  const snippetData = {
    sr: "test",
    title: "Test Snippet",
    kind: "self",
    code: "console.log('hello')",
    description: "A test snippet",
    snippet_type: "javascript",
    star_count: 5,
    owner_name: "test_user",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }

  const response = await axios.post("/api/submit", snippetData)
  expect(response.data.json.errors).toHaveLength(0)
  expect(response.data.json.data).toBeDefined()

  // Verify post appears in listing with snippet data
  const listResponse = await axios.get("/api/info")
  const post = listResponse.data.data.children[0].data
  const storedSnippet = JSON.parse(post.selftext)
  
  expect(post.author).toBe("test_user")
  expect(post.score).toBe(5)
  expect(storedSnippet.code).toBe(snippetData.code)
  expect(storedSnippet.snippet_type).toBe(snippetData.snippet_type)
  expect(storedSnippet.star_count).toBe(snippetData.star_count)
})

test("reject snippet with low stars", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/submit", {
    sr: "test",
    title: "Low Stars Snippet",
    kind: "self",
    code: "test code",
    star_count: 1
  })

  expect(response.data.json.errors).toHaveLength(1)
  expect(response.data.json.errors[0][0]).toBe("star_count")
})

test("support alternative subreddit parameter", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/submit", {
    subreddit: "test",  // Using 'subreddit' instead of 'sr'
    title: "Test Post",
    text: "Test Content",
    kind: "self"
  })

  expect(response.data.json.errors).toHaveLength(0)
  expect(response.data.json.data).toBeDefined()

  const listResponse = await axios.get("/api/info")
  const post = listResponse.data.data.children[0].data
  expect(post.subreddit).toBe("test")
})

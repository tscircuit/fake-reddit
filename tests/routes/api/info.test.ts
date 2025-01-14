import { getTestServer } from "tests/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("list posts with pagination", async () => {
  const { axios } = await getTestServer()

  // Create multiple test posts
  for (let i = 1; i <= 30; i++) {
    await axios.post("/api/submit", {
      sr: "test",
      title: `Test Post ${i}`,
      text: `Test Content ${i}`,
      kind: "self",
    })
  }

  // Test default listing (should return 25 posts)
  const defaultResponse = await axios.get("/api/info")
  expect(defaultResponse.data.data.children).toHaveLength(25)
  expect(defaultResponse.data.data.after).toBeTruthy()
  expect(defaultResponse.data.data.before).toBeNull()

  // Test pagination with 'after'
  const afterResponse = await axios.get(`/api/info?after=${defaultResponse.data.data.after}`)
  expect(afterResponse.data.data.children).toHaveLength(5)
  expect(afterResponse.data.data.after).toBeNull()
  expect(afterResponse.data.data.before).toBeTruthy()

  // Test with custom limit
  const limitResponse = await axios.get("/api/info?limit=10")
  expect(limitResponse.data.data.children).toHaveLength(10)
  expect(limitResponse.data.data.after).toBeTruthy()

  // Test subreddit filtering
  const subredditResponse = await axios.get("/api/info?sr_name=test")
  expect(subredditResponse.data.data.children.every((post: {data: {subreddit: string}}) => post.data.subreddit === "test")).toBe(true)
})

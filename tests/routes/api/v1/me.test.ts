import { getTestServer } from "tests/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("get authenticated user info", async () => {
  const { axios } = await getTestServer()
  
  // Set authorization token
  axios.setAuthToken("Bearer fake_token")
  
  const response = await axios.get("/api/v1/me")
  expect(response.data.data.name).toBe("fake_user")
  expect(response.data.data.created).toBeDefined()
  expect(response.data.data.created_utc).toBeDefined()
  expect(response.data.data.has_verified_email).toBe(true)
  expect(response.data.data.modhash).toBe("fake_modhash")
  expect(response.data.data.cookie).toBe("reddit_session=fake_session")
  expect(response.data.error).toBeUndefined()
})

test("handle unauthenticated request", async () => {
  const { axios } = await getTestServer()
  
  // Clear authorization token
  axios.clearAuthToken()
  
  const response = await axios.get("/api/v1/me")
  expect(response.data.error).toBe(401)
  expect(response.data.message).toBe("Unauthorized")
  expect(response.data.name).toBeUndefined()
})

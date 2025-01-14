import { afterEach } from "bun:test"
import { tmpdir } from "node:os"
import defaultAxios from "redaxios"
import { startServer } from "./start-server"

interface TestFixture {
  url: string
  server: any
  axios: typeof defaultAxios & {
    setAuthToken(token: string): void
    clearAuthToken(): void
  }
}

export const getTestServer = async (): Promise<TestFixture> => {
  const port = 3001 + Math.floor(Math.random() * 999)
  const testInstanceId = Math.random().toString(36).substring(2, 15)
  const testDbName = `testdb${testInstanceId}`

  const server = await startServer({
    port,
    testDbName,
  })

  const url = `http://127.0.0.1:${port}`
  const axios = defaultAxios.create({
    baseURL: url,
    headers: {}
  })

  // Helper methods for auth token management
  const setAuthToken = (token: string) => {
    if (!axios.defaults.headers) axios.defaults.headers = {}
    ;(axios.defaults.headers as Record<string, string>)['authorization'] = token
  }

  const clearAuthToken = () => {
    if (axios.defaults.headers) {
      delete (axios.defaults.headers as Record<string, string>)['authorization']
    }
  }

  afterEach(async () => {
    await server.stop()
    clearAuthToken()
    // Here you might want to add logic to drop the test database
  })

  return {
    url,
    server,
    axios: Object.assign(axios, { setAuthToken, clearAuthToken }),
  }
}

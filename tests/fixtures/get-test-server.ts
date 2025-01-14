import { afterEach } from "bun:test"
import { tmpdir } from "node:os"
import defaultAxios from "redaxios"
import type { Options, Response } from "redaxios"
import { startServer } from "./start-server"

interface CustomAxios {
  get: <T = any>(url: string, config?: Options) => Promise<Response<T>>
  post: <T = any>(url: string, data?: any, config?: Options) => Promise<Response<T>>
  delete: <T = any>(url: string, config?: Options) => Promise<Response<T>>
  _authToken: string
  setAuthToken: (token: string) => void
  clearAuthToken: () => void
}

interface TestFixture {
  url: string
  server: any
  axios: CustomAxios
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
  // Create axios instance with base configuration
  const axiosInstance = defaultAxios.create({
    baseURL: url
  })

  // Create wrapped axios instance with auth helper methods
  const axios: CustomAxios = {
    get: (url, config = {}) => 
      axiosInstance.get(url, { ...config, headers: { Authorization: axios._authToken } }),
    post: (url, data, config = {}) => 
      axiosInstance.post(url, data, { ...config, headers: { Authorization: axios._authToken } }),
    delete: (url, config = {}) => 
      axiosInstance.delete(url, { ...config, headers: { Authorization: axios._authToken } }),
    _authToken: "",
    setAuthToken: (token) => { axios._authToken = token },
    clearAuthToken: () => { axios._authToken = "" }
  }

  afterEach(async () => {
    await server.stop()
    // Here you might want to add logic to drop the test database
  })

  return {
    url,
    server,
    axios,
  }
}

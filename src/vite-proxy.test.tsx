// @vitest-environment node

import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { request as httpRequest } from 'node:http'
import { describe, expect, it } from 'vitest'
import { createServer as createViteServer } from 'vite'

interface CapturedRequest {
  method: string | undefined
  url: string | undefined
  body: string
}

function listen(server: ReturnType<typeof createServer>): Promise<AddressInfo> {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        reject(new Error('Expected the test server to bind to a TCP port.'))
        return
      }
      resolve(address)
    })
  })
}

function close(server: { close: (callback: (error?: Error) => void) => void }): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function postJson(
  port: number,
  path: string,
  body: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        host: '127.0.0.1',
        port,
        path,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body),
        },
      },
      (response) => {
        const chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => chunks.push(chunk))
        response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      },
    )

    request.once('error', reject)
    request.end(body)
  })
}

describe('Vite API proxy', () => {
  it('forwards the POST URI and JSON body to API_UPSTREAM', async () => {
    const capturedRequest: CapturedRequest = {
      method: undefined,
      url: undefined,
      body: '',
    }
    const backend = createServer((request, response) => {
      const chunks: Buffer[] = []
      request.on('data', (chunk: Buffer) => chunks.push(chunk))
      request.on('end', () => {
        capturedRequest.method = request.method
        capturedRequest.url = request.url
        capturedRequest.body = Buffer.concat(chunks).toString('utf8')
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end('{"received":true}')
      })
    })

    const backendAddress = await listen(backend)
    const previousUpstream = process.env.API_UPSTREAM
    process.env.API_UPSTREAM = `http://127.0.0.1:${backendAddress.port}`
    let viteServer: Awaited<ReturnType<typeof createViteServer>> | undefined

    try {
      viteServer = await createViteServer({
        configFile: 'vite.config.ts',
        mode: 'test',
        logLevel: 'silent',
        server: {
          host: '127.0.0.1',
          port: 0,
        },
      })
      await viteServer.listen()
      const viteAddress = viteServer.httpServer?.address()
      if (!viteAddress || typeof viteAddress === 'string') {
        throw new Error('Expected Vite to bind to a TCP port.')
      }

      const requestBody = JSON.stringify({ body: { info: { email: 'user@example.com' } } })
      const responseBody = await postJson(
        viteAddress.port,
        '/userController/register?source=review',
        requestBody,
      )

      expect(responseBody).toBe('{"received":true}')
      expect(capturedRequest).toEqual({
        method: 'POST',
        url: '/userController/register?source=review',
        body: requestBody,
      })
    } finally {
      await viteServer?.close()
      await close(backend)
      if (previousUpstream === undefined) {
        delete process.env.API_UPSTREAM
      } else {
        process.env.API_UPSTREAM = previousUpstream
      }
    }
  }, 15000)
})

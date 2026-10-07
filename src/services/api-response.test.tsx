import { describe, expect, it } from 'vitest'
import { getApiResponseMessage, getApiResponseStatus } from './api-response'

describe('getApiResponseMessage', () => {
  it('returns Message from the legacy API response header', () => {
    expect(getApiResponseMessage({
      header: { Status: 'Failed', Message: '帳號已存在' },
      body: { info: {} },
    })).toBe('帳號已存在')
  })

  it('supports lower-case response fields and normalizes status casing', () => {
    const response = { header: { status: 'success', message: '註冊成功' } }

    expect(getApiResponseMessage(response)).toBe('註冊成功')
    expect(getApiResponseStatus(response)).toBe('success')
    expect(getApiResponseStatus({ header: { Status: 'Failed' } })).toBe('failed')
  })

  it('reads lower-case status and message from the latest headers node', () => {
    const response = { headers: { status: 'Failed', message: '帳號已存在' } }

    expect(getApiResponseStatus(response)).toBe('failed')
    expect(getApiResponseMessage(response)).toBe('帳號已存在')
  })

  it('prefers headers and lower-case fields without mixing conflicting values', () => {
    const response = {
      headers: { status: 42, Status: 'Success', message: '', Message: 'stale message' },
      header: { Status: 'Failed', Message: 'other node' },
    }

    expect(getApiResponseStatus(response)).toBeUndefined()
    expect(getApiResponseMessage(response)).toBeUndefined()
  })

  it('returns undefined when the response has no non-empty Message or status', () => {
    expect(getApiResponseMessage(null)).toBeUndefined()
    expect(getApiResponseMessage({ header: {} })).toBeUndefined()
    expect(getApiResponseMessage({ header: { Message: '  ' } })).toBeUndefined()
    expect(getApiResponseMessage({ headers: null, header: { Message: 'ignored' } })).toBeUndefined()
    expect(getApiResponseStatus(null)).toBeUndefined()
    expect(getApiResponseStatus({ header: {} })).toBeUndefined()
  })
})

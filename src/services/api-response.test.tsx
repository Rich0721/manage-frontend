import { describe, expect, it } from 'vitest'
import { getApiResponseMessage } from './api-response'

describe('getApiResponseMessage', () => {
  it('returns Message from the API response header', () => {
    expect(getApiResponseMessage({
      header: { Status: 'Failed', Message: '帳號已存在' },
      body: { info: {} },
    })).toBe('帳號已存在')
  })

  it('returns undefined when the response has no non-empty Message', () => {
    expect(getApiResponseMessage(null)).toBeUndefined()
    expect(getApiResponseMessage({ header: {} })).toBeUndefined()
    expect(getApiResponseMessage({ header: { Message: '  ' } })).toBeUndefined()
    expect(getApiResponseMessage({ header: { message: 'lowercase key' } })).toBeUndefined()
  })
})

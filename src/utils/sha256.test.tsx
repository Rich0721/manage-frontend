import { describe, expect, it } from 'vitest'
import { sha256 } from './sha256'

describe('sha256', () => {
  it('returns the standard SHA-256 digest for the known abc vector', async () => {
    await expect(sha256('abc')).resolves.toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })
})

import { describe, expect, it } from 'vitest'
import { parsePositiveInteger, parseQuantity } from './sell-validation'

describe('sell input validation', () => {
  it.each([['1', 1], ['150', 150], ['999999999', 999999999]])('accepts positive whole amount %s', (input, expected) => {
    expect(parsePositiveInteger(input)).toBe(expected)
  })

  it.each(['', '0', '-1', '1.5', 'abc', '1.1.2', '9007199254740992'])('rejects invalid positive amount %s', (input) => {
    expect(parsePositiveInteger(input)).toBeNull()
  })

  it('allows zero quantity so the caller can remove the row', () => {
    expect(parseQuantity('0')).toBe(0)
    expect(parseQuantity('3')).toBe(3)
    expect(parseQuantity('-1')).toBeNull()
    expect(parseQuantity('1.5')).toBeNull()
    expect(parseQuantity('abc')).toBeNull()
  })
})

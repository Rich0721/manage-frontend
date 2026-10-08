import { describe, expect, it } from 'vitest'
import { normalizeLoginForm, validateLoginForm } from './auth-validation'

describe('login validation', () => {
  it('reuses registration email and password rules without extra fields', () => {
    expect(normalizeLoginForm({ email: ' user@example.com ', password: ' Password123 ' }))
      .toEqual({ email: 'user@example.com', password: 'Password123' })
    expect(validateLoginForm({ email: 'user@example.com', password: 'Password123' })).toEqual({})
  })

  it.each([
    ['', 'Password123', 'email'],
    ['invalid@example', 'Password123', 'email'],
    ['user@example.com', 'bad', 'password'],
    ['user@example.com', '', 'password'],
  ])('rejects invalid login data', (email, password, field) => {
    expect(validateLoginForm({ email, password })).toHaveProperty(field)
  })
})

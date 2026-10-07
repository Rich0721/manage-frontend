import { describe, expect, it } from 'vitest'
import type { RegisterFormValues } from '../types/register'
import { normalizeRegisterForm, validateRegisterForm } from './register-validation'

const validValues: RegisterFormValues = {
  name: 'user123',
  email: 'user@example.com',
  password: 'ValidPass123',
  confirmPassword: 'ValidPass123',
}

describe('register form validation', () => {
  it('normalizes outer whitespace without changing the source values', () => {
    const values = {
      name: '  user123  ',
      email: ' user@example.com ',
      password: ' ValidPass123 ',
      confirmPassword: ' ValidPass123 ',
    }

    expect(normalizeRegisterForm(values)).toEqual(validValues)
    expect(values.name).toBe('  user123  ')
  })

  it('accepts name, email, and password length boundaries', () => {
    expect(validateRegisterForm({
      ...validValues,
      name: 'ab',
      email: 'acx@example.com',
      password: 'Ab123456',
      confirmPassword: 'Ab123456',
    })).toEqual({})

    expect(validateRegisterForm({
      ...validValues,
      name: 'a'.repeat(50),
      email: `${'a'.repeat(238)}@example.com`,
      password: 'Ab111111111111111111',
      confirmPassword: 'Ab111111111111111111',
    })).toEqual({})
  })

  it.each([
    ['name lower boundary', 'ab', undefined],
    ['name upper boundary', 'a'.repeat(50), undefined],
    ['name below lower boundary', 'a', '姓名長度'],
    ['name above upper boundary', 'a'.repeat(51), '姓名長度'],
  ])('%s', (_caseName, name, expectedError) => {
    const error = validateRegisterForm({ ...validValues, name }).name
    if (expectedError) expect(error).toContain(expectedError)
    else expect(error).toBeUndefined()
  })

  it.each([
    ['Email at 14 characters', 'a@bcdefghijklm', 'Email長度'],
    ['Email at 15 characters', 'acx@example.com', undefined],
    ['Email at 250 characters', `${'a'.repeat(238)}@example.com`, undefined],
    ['Email at 251 characters', `${'a'.repeat(239)}@example.com`, 'Email長度'],
  ])('%s', (_caseName, email, expectedError) => {
    const error = validateRegisterForm({ ...validValues, email }).email
    if (expectedError) expect(error).toContain(expectedError)
    else expect(error).toBeUndefined()
  })

  it.each([
    ['password at 7 characters', 'Ab12345', '密碼長度'],
    ['password at 8 characters', 'Ab123456', undefined],
    ['password at 20 characters', 'Ab111111111111111111', undefined],
    ['password at 21 characters', 'Ab1111111111111111111', '密碼長度'],
    ['confirm password missing uppercase', 'validpass123', '確認密碼須包含'],
    ['confirm password missing lowercase', 'VALIDPASS123', '確認密碼須包含'],
    ['confirm password missing digit', 'ValidPassword', '確認密碼須包含'],
  ])('%s', (_caseName, password, expectedError) => {
    const field = _caseName.startsWith('confirm') ? 'confirmPassword' : 'password'
    const error = validateRegisterForm({
      ...validValues,
      [field]: password,
      ...(field === 'password' ? { confirmPassword: password } : {}),
    })[field]
    if (expectedError) expect(error).toContain(expectedError)
    else expect(error).toBeUndefined()
  })

  it.each(['user@@example.com', 'user@example..com', 'user @example.com'])(
    'rejects malformed email %s',
    (email) => {
      expect(validateRegisterForm({ ...validValues, email }).email).toBe('Email 格式不合法')
    },
  )

  it('rejects fields outside their length and format rules', () => {
    const errors = validateRegisterForm({
      ...validValues,
      name: 'a',
      email: `${'a'.repeat(239)}@example.com`,
      password: 'validpass123',
      confirmPassword: 'OtherPass123',
    })

    expect(errors.name).toContain('2 至 50')
    expect(errors.email).toContain('15 至 250')
    expect(errors.password).toContain('大小寫字母及數字')
    expect(errors.confirmPassword).toContain('密碼不一致')
  })

  it('treats whitespace-only values as required and counts Unicode code points', () => {
    expect(validateRegisterForm({
      ...validValues,
      name: '   ',
      email: '   ',
      password: '   ',
      confirmPassword: '   ',
    })).toEqual({
      name: '此欄位為必填',
      email: '此欄位為必填',
      password: '此欄位為必填',
      confirmPassword: '此欄位為必填',
    })

    expect(validateRegisterForm({
      ...validValues,
      name: '😀',
    }).name).toContain('2 至 50')
  })
})

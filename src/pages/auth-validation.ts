import type { LoginFormValues, LoginValidationErrors } from '../types/auth'
import type { RegisterFormValues, RegisterValidationErrors } from '../types/register'
import { getEmailError, getPasswordError } from './register-validation'

export function normalizeLoginForm(values: LoginFormValues): LoginFormValues {
  return { email: values.email.trim(), password: values.password.trim() }
}

export function validateLoginForm(values: LoginFormValues): LoginValidationErrors {
  const normalized = normalizeLoginForm(values)
  return {
    ...(!normalized.email ? { email: '此欄位為必填' } : {}),
    ...(normalized.email && getEmailError(normalized.email)
      ? { email: getEmailError(normalized.email) }
      : {}),
    ...(!normalized.password ? { password: '此欄位為必填' } : {}),
    ...(normalized.password && getPasswordError(normalized.password, '密碼')
      ? { password: getPasswordError(normalized.password, '密碼') }
      : {}),
  }
}

export function validateSharedAuthFields(
  values: Pick<RegisterFormValues, 'email' | 'password'>,
): Pick<RegisterValidationErrors, 'email' | 'password'> {
  return validateLoginForm(values)
}

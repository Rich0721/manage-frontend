import type {
  RegisterFieldName,
  RegisterFormValues,
  RegisterValidationErrors,
} from '../types/register'

const NAME_MIN_LENGTH = 2
const NAME_MAX_LENGTH = 50
const EMAIL_MIN_LENGTH = 15
const EMAIL_MAX_LENGTH = 250
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 20
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/
const UPPERCASE_PATTERN = /[A-Z]/
const LOWERCASE_PATTERN = /[a-z]/
const DIGIT_PATTERN = /\d/

const FIELD_NAMES: readonly RegisterFieldName[] = [
  'name',
  'email',
  'password',
  'confirmPassword',
]

export function normalizeRegisterForm(
  values: RegisterFormValues,
): RegisterFormValues {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password.trim(),
    confirmPassword: values.confirmPassword.trim(),
  }
}

export function getLengthError(
  value: string,
  minLength: number,
  maxLength: number,
  label: string,
): string | undefined {
  const length = Array.from(value).length
  if (length < minLength || length > maxLength) {
    return `${label}長度須為 ${minLength} 至 ${maxLength} 個字元`
  }
  return undefined
}

export function getPasswordError(value: string, label: string): string | undefined {
  const lengthError = getLengthError(
    value,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    label,
  )
  if (lengthError) return lengthError

  if (
    !UPPERCASE_PATTERN.test(value) ||
    !LOWERCASE_PATTERN.test(value) ||
    !DIGIT_PATTERN.test(value)
  ) {
    return `${label}須包含大小寫字母及數字`
  }

  return undefined
}

export function getEmailError(value: string): string | undefined {
  const lengthError = getLengthError(value, EMAIL_MIN_LENGTH, EMAIL_MAX_LENGTH, 'Email')
  if (lengthError) return lengthError
  return EMAIL_PATTERN.test(value) ? undefined : 'Email 格式不合法'
}

export function validateRegisterForm(
  values: RegisterFormValues,
): RegisterValidationErrors {
  const normalized = normalizeRegisterForm(values)
  const errors: RegisterValidationErrors = {}

  for (const fieldName of FIELD_NAMES) {
    if (!normalized[fieldName]) {
      errors[fieldName] = '此欄位為必填'
    }
  }

  if (normalized.name) {
    errors.name = getLengthError(
      normalized.name,
      NAME_MIN_LENGTH,
      NAME_MAX_LENGTH,
      '姓名',
    )
  }

  if (normalized.email) {
    errors.email = getEmailError(normalized.email)
  }

  if (normalized.password) {
    errors.password = getPasswordError(normalized.password, '密碼')
  }

  if (normalized.confirmPassword) {
    errors.confirmPassword = getPasswordError(
      normalized.confirmPassword,
      '確認密碼',
    )
    if (
      !errors.confirmPassword &&
      normalized.password &&
      normalized.confirmPassword !== normalized.password
    ) {
      errors.confirmPassword = '密碼不一致，請重新輸入'
    }
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message),
  ) as RegisterValidationErrors
}

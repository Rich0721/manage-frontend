import type { ChangeEventHandler, FocusEventHandler, FormEventHandler } from 'react'
import type { LoginFormValues, LoginValidationErrors } from '../../types/auth'
import { FormField } from '../FormField/FormField'
import { Button } from '../Button/Button'
import './LoginForm.css'

interface LoginFormProps {
  values: LoginFormValues
  errors: LoginValidationErrors
  submitting: boolean
  canSubmit: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
  onBlur: FocusEventHandler<HTMLInputElement>
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function LoginForm({ values, errors, submitting, canSubmit, onChange, onBlur, onSubmit }: LoginFormProps) {
  return (
    <form className="login-form" aria-label="登入表單" onSubmit={onSubmit} noValidate>
      <FormField
        id="login-email"
        name="email"
        label="Email"
        type="email"
        autoComplete="username"
        value={values.email}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.email}
      />
      <FormField
        id="login-password"
        name="password"
        label="密碼"
        type="password"
        autoComplete="current-password"
        value={values.password}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.password}
      />
      <Button className="login-form__submit" type="submit" disabled={!canSubmit || submitting}>
        {submitting ? '送出中…' : '登入'}
      </Button>
    </form>
  )
}

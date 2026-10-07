import type { ChangeEventHandler, FocusEventHandler } from 'react'
import type { RegisterFormValues } from '../../types/register'
import { FormField } from '../FormField/FormField'
import './LoginForm.css'

interface LoginFormProps {
  values: Pick<RegisterFormValues, 'email' | 'password'>
  onChange: ChangeEventHandler<HTMLInputElement>
  onBlur: FocusEventHandler<HTMLInputElement>
}

export function LoginForm({ values, onChange, onBlur }: LoginFormProps) {
  return (
    <section className="login-form" aria-label="登入表單">
      <FormField
        id="login-email"
        name="email"
        label="Email"
        type="email"
        autoComplete="username"
        value={values.email}
        onChange={onChange}
        onBlur={onBlur}
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
      />
      <button className="login-form__submit" type="button" disabled>
        登入
      </button>
      <p className="login-form__notice">登入功能尚未開放</p>
    </section>
  )
}

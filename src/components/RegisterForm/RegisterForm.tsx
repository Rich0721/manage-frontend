import type {
  ChangeEventHandler,
  FormEventHandler,
  FocusEventHandler,
} from 'react'
import type {
  RegisterFormValues,
  RegisterValidationErrors,
} from '../../types/register'
import { FormField } from '../FormField/FormField'
import { Button } from '../Button/Button'
import './RegisterForm.css'

interface RegisterFormProps {
  values: RegisterFormValues
  errors: RegisterValidationErrors
  submitting: boolean
  canSubmit: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
  onBlur: FocusEventHandler<HTMLInputElement>
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function RegisterForm({
  values,
  errors,
  submitting,
  canSubmit,
  onChange,
  onBlur,
  onSubmit,
}: RegisterFormProps) {
  return (
    <form className="register-form" aria-label="註冊表單" onSubmit={onSubmit} noValidate>
      <FormField
        id="register-name"
        name="name"
        label="姓名"
        type="text"
        autoComplete="name"
        value={values.name}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.name}
      />
      <FormField
        id="register-email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.email}
      />
      <FormField
        id="register-password"
        name="password"
        label="密碼"
        type="password"
        autoComplete="new-password"
        value={values.password}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.password}
      />
      <FormField
        id="register-confirm-password"
        name="confirmPassword"
        label="確認密碼"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.confirmPassword}
      />
      <Button
        className="register-form__submit"
        type="submit"
        disabled={!canSubmit || submitting}
      >
        {submitting ? '送出中…' : '註冊'}
      </Button>
    </form>
  )
}

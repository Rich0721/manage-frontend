import { fireEvent, render, screen, within } from '@testing-library/react'
import type { FormEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { RegisterFormValues } from '../../types/register'
import { RegisterForm } from './RegisterForm'

const values: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

describe('RegisterForm', () => {
  it('renders four accessible fields and sends submit to its owner', () => {
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())
    render(
      <RegisterForm
        values={values}
        errors={{ email: 'Email 格式不合法' }}
        submitting={false}
        canSubmit={false}
        onChange={() => undefined}
        onBlur={() => undefined}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByLabelText('姓名')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Email 格式不合法')
    expect(screen.getByLabelText('密碼')).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText('確認密碼')).toHaveAttribute('type', 'password')
    const form = screen.getByRole('form', { name: '註冊表單' })
    expect(within(form).getByRole('button', { name: '註冊' })).toBeDisabled()
    fireEvent.submit(form)
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { FormEvent } from 'react'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('shows login fields and submits through the form when valid', () => {
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())
    render(
      <LoginForm
        values={{ email: '', password: '' }}
        errors={{}}
        submitting={false}
        canSubmit={true}
        onChange={() => undefined}
        onBlur={() => undefined}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('密碼')).toHaveAttribute('type', 'password')
    const form = screen.getByRole('form', { name: '登入表單' })
    fireEvent.submit(form)
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: '登入' })).toBeEnabled()
  })
})

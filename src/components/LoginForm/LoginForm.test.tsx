import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('shows the planned login fields and leaves login unavailable', () => {
    render(
      <LoginForm
        values={{ email: '', password: '' }}
        onChange={() => undefined}
        onBlur={() => undefined}
      />,
    )

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('密碼')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: '登入' })).toBeDisabled()
    expect(screen.getByText('登入功能尚未開放')).toBeInTheDocument()
  })
})

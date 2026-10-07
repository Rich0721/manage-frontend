import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { FormEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AuthTabs } from './AuthTabs'

describe('AuthTabs', () => {
  it('marks the selected mode and reports keyboard activation without submitting a form', async () => {
    const user = userEvent.setup()
    const onModeChange = vi.fn()
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <AuthTabs mode="register" onModeChange={onModeChange} />
        <button type="submit">Submit</button>
      </form>,
    )

    expect(screen.getByRole('button', { name: '註冊' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '登入' })).toHaveAttribute('aria-pressed', 'false')
    await user.tab()
    await user.keyboard('{Enter}')
    expect(onModeChange).toHaveBeenCalledWith('login')
    await user.tab()
    await user.keyboard(' ')
    expect(onModeChange).toHaveBeenLastCalledWith('register')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

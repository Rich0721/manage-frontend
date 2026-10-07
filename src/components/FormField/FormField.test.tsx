import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('connects its label to the input and exposes a supplied error accessibly', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onBlur = vi.fn()
    render(
      <FormField
        id="email"
        label="Email"
        type="email"
        value="bad"
        onChange={onChange}
        onBlur={onBlur}
        error="Email 格式不合法"
      />,
    )

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Email 格式不合法')
    await user.clear(input)
    expect(onChange).toHaveBeenCalled()
    await user.tab()
    expect(onBlur).toHaveBeenCalled()
  })

  it('does not expose an error when no error was supplied', () => {
    render(
      <FormField
        id="name"
        label="姓名"
        type="text"
        value=""
        onChange={() => undefined}
        onBlur={() => undefined}
      />,
    )

    expect(screen.getByLabelText('姓名')).toHaveAttribute('aria-invalid', 'false')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

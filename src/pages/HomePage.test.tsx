import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'
import { registerUser, RegisterServiceError } from '../services/register-service'

vi.mock('../services/register-service', () => ({
  RegisterServiceError: class RegisterServiceError extends Error {
    readonly kind: string

    constructor(kind: string, message: string) {
      super(message)
      this.kind = kind
    }
  },
  registerUser: vi.fn(),
}))

const registerUserMock = vi.mocked(registerUser)
const registerSubmitButton = () =>
  within(screen.getByRole('form', { name: '註冊表單' })).getByRole('button', {
    name: /註冊|送出中/,
  })
const authTab = (name: '登入' | '註冊') =>
  within(screen.getByRole('group', { name: '登入或註冊' })).getByRole('button', { name })

beforeEach(() => {
  registerUserMock.mockReset()
  vi.spyOn(window, 'alert').mockImplementation(() => undefined)
})

describe('HomePage registration flow', () => {
  it('starts with an empty register form and enables submit only for valid values', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    const submit = registerSubmitButton()
    expect(screen.getByLabelText('姓名')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(submit).toBeDisabled()
    expect(registerUserMock).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('姓名'), 'user123')
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('密碼'), 'ValidPass123')
    await user.type(screen.getByLabelText('確認密碼'), 'ValidPass123')
    expect(submit).toBeEnabled()

    await user.clear(screen.getByLabelText('密碼'))
    expect(submit).toBeDisabled()
  })

  it('shows field errors after blur and does not call the service for invalid submit', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    await user.type(screen.getByLabelText('姓名'), 'a')
    await user.tab()
    expect(screen.getByText('姓名長度須為 2 至 50 個字元')).toBeInTheDocument()
    expect(registerUserMock).not.toHaveBeenCalled()
  })

  it('revalidates a direct form submit before calling the service', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    await user.type(screen.getByLabelText('Email'), 'invalid@invaliddomain')
    await user.type(screen.getByLabelText('密碼'), 'ValidPass123')
    await user.type(screen.getByLabelText('確認密碼'), 'ValidPass123')
    const form = screen.getByRole('form', { name: '註冊表單' })
    fireEvent.submit(form)
    expect(form).toBeInTheDocument()
    expect(screen.getByText('Email 格式不合法')).toBeInTheDocument()
    expect(registerUserMock).not.toHaveBeenCalled()
  })

  it('preserves failed input for retry and clears both forms on a real mode switch', async () => {
    const user = userEvent.setup()
    registerUserMock
      .mockResolvedValueOnce({ status: 'failed', message: '此帳號已存在' })
      .mockResolvedValueOnce({ status: 'success', message: '註冊成功' })
    render(<HomePage />)

    await user.type(screen.getByLabelText('姓名'), 'user123')
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('密碼'), 'ValidPass123')
    await user.type(screen.getByLabelText('確認密碼'), 'ValidPass123')
    await user.click(registerSubmitButton())
    expect(await screen.findByDisplayValue('user123')).toBeInTheDocument()
    expect(window.alert).toHaveBeenCalledWith('此帳號已存在')

    await user.click(registerSubmitButton())
    await screen.findByLabelText('登入表單')
    expect(window.alert).toHaveBeenLastCalledWith('註冊成功')
    expect(screen.getByLabelText('登入表單')).toBeInTheDocument()
    expect(within(screen.getByLabelText('登入表單')).getByRole('button', { name: '登入' })).toBeDisabled()

    await user.click(authTab('註冊'))
    expect(screen.getByLabelText('姓名')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(window.location.pathname).toBe('/')
  })

  it('keeps the entered values after a connection error and allows retry', async () => {
    const user = userEvent.setup()
    registerUserMock
      .mockRejectedValueOnce(new Error('connection lost'))
      .mockResolvedValueOnce({ status: 'success', message: '註冊成功' })
    render(<HomePage />)

    await user.type(screen.getByLabelText('姓名'), 'user123')
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('密碼'), 'ValidPass123')
    await user.type(screen.getByLabelText('確認密碼'), 'ValidPass123')
    await user.click(registerSubmitButton())
    expect(window.alert).toHaveBeenCalledWith('連線異常，請稍後再試')
    expect(screen.getByLabelText('姓名')).toHaveValue('user123')
    expect(registerSubmitButton()).toBeEnabled()

    await user.click(registerSubmitButton())
    await screen.findByLabelText('登入表單')
    expect(registerUserMock).toHaveBeenCalledTimes(2)
  })

  it('shows the API message for a non-2xx HTTP response', async () => {
    const user = userEvent.setup()
    registerUserMock.mockRejectedValueOnce(
      new RegisterServiceError('http', '帳號已存在'),
    )
    render(<HomePage />)

    await user.type(screen.getByLabelText('姓名'), 'user123')
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('密碼'), 'ValidPass123')
    await user.type(screen.getByLabelText('確認密碼'), 'ValidPass123')
    await user.click(registerSubmitButton())

    expect(window.alert).toHaveBeenCalledWith('帳號已存在')
    expect(screen.getByLabelText('Email')).toHaveValue('user@example.com')
  })

  it('does not clear input when the selected mode is selected again', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.type(screen.getByLabelText('姓名'), 'user123')
    await user.click(registerSubmitButton())
    expect(screen.getByLabelText('姓名')).toHaveValue('user123')
  })

  it('ignores a stale response after switching modes and starting a newer request', async () => {
    const user = userEvent.setup()
    let resolveFirst!: (value: { status: 'failed'; message: string }) => void
    let resolveSecond!: (value: { status: 'failed'; message: string }) => void
    const firstRequest = new Promise<{ status: 'failed'; message: string }>((resolve) => {
      resolveFirst = resolve
    })
    const secondRequest = new Promise<{ status: 'failed'; message: string }>((resolve) => {
      resolveSecond = resolve
    })
    registerUserMock
      .mockImplementationOnce(() => firstRequest)
      .mockImplementationOnce(() => secondRequest)
    render(<HomePage />)

    const fillValidForm = async () => {
      await user.type(screen.getByLabelText('姓名'), 'user123')
      await user.type(screen.getByLabelText('Email'), 'user@example.com')
      await user.type(screen.getByLabelText('密碼'), 'ValidPass123')
      await user.type(screen.getByLabelText('確認密碼'), 'ValidPass123')
    }

    await fillValidForm()
    await user.click(registerSubmitButton())
    expect(registerUserMock).toHaveBeenCalledOnce()
    const firstSignal = registerUserMock.mock.calls[0]?.[1]
    await user.click(authTab('登入'))
    expect(firstSignal?.aborted).toBe(true)
    await user.click(authTab('註冊'))
    await fillValidForm()
    await user.click(registerSubmitButton())
    expect(registerUserMock).toHaveBeenCalledTimes(2)

    await act(async () => resolveFirst({ status: 'failed', message: '過期回應' }))
    expect(window.alert).not.toHaveBeenCalled()
    expect(registerSubmitButton()).toBeDisabled()

    await act(async () => resolveSecond({ status: 'failed', message: '第二次請求失敗' }))
    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'newuser@example.com')
    expect(registerSubmitButton()).toBeEnabled()
    await Promise.resolve()
    expect(window.alert).toHaveBeenCalledTimes(1)
    expect(window.alert).toHaveBeenCalledWith('第二次請求失敗')
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import App from './App'
import { getProducts } from './services/product-service'
import { AuthServiceError, loginUser, logoutUser } from './services/auth-service'

vi.mock('./services/product-service', () => ({ getProducts: vi.fn() }))
vi.mock('./services/auth-service', () => ({
  AuthServiceError: class AuthServiceError extends Error { kind: string; constructor(kind: string, message: string) { super(message); this.kind = kind } },
  logoutUser: vi.fn(),
  loginUser: vi.fn(),
}))

const session = { uid: 'u1', authorization: 'token', userName: 'Tester' }
const getProductsMock = vi.mocked(getProducts)
const loginMock = vi.mocked(loginUser)
const logoutMock = vi.mocked(logoutUser)

afterEach(() => {
  vi.restoreAllMocks()
  sessionStorage.clear()
  getProductsMock.mockReset()
  loginMock.mockReset()
  logoutMock.mockReset()
})

describe('App session flow', () => {
  it('starts in login mode without a saved session and does not request products', async () => {
    render(<App />)
    expect(await screen.findByRole('form', { name: '登入表單' })).toBeInTheDocument()
    expect(getProductsMock).not.toHaveBeenCalled()
  })

  it('restores session after reload and loads products without logging in again', async () => {
    sessionStorage.setItem('manage-frontend.auth-session', JSON.stringify(session))
    getProductsMock.mockResolvedValue([])
    render(<App />)
    expect(await screen.findByText('目前無產品')).toBeInTheDocument()
    expect(getProductsMock).toHaveBeenCalledWith(session, expect.any(AbortSignal))
    expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it.each([
    ['malformed JSON', '{'],
    ['missing authorization', JSON.stringify({ uid: 'u1', userName: 'Tester' })],
    ['empty uid', JSON.stringify({ uid: '  ', authorization: 'token', userName: 'Tester' })],
  ])('clears %s session data and does not request products', async (_label, storedValue) => {
    sessionStorage.setItem('manage-frontend.auth-session', storedValue)
    render(<App />)
    expect(await screen.findByRole('form', { name: '登入表單' })).toBeInTheDocument()
    expect(sessionStorage.getItem('manage-frontend.auth-session')).toBeNull()
    expect(getProductsMock).not.toHaveBeenCalled()
  })

  it('returns to login when reading sessionStorage fails', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage unavailable') })
    render(<App />)
    expect(await screen.findByRole('form', { name: '登入表單' })).toBeInTheDocument()
    expect(getProductsMock).not.toHaveBeenCalled()
    expect(window.alert).toHaveBeenCalledWith('無法讀取登入狀態，請重新登入')
  })

  it('saves the returned session and loads products after login', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValue(session)
    getProductsMock.mockResolvedValue([])
    render(<App />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('密碼'), 'Password123')
    await user.click(within(screen.getByRole('form', { name: '登入表單' })).getByRole('button', { name: '登入' }))
    expect(await screen.findByText('目前無產品')).toBeInTheDocument()
    expect(sessionStorage.getItem('manage-frontend.auth-session')).toBe(JSON.stringify(session))
    expect(loginMock).toHaveBeenCalledOnce()
    expect(getProductsMock).toHaveBeenCalledWith(session, expect.any(AbortSignal))
  })

  it('keeps the current login active in memory when saving sessionStorage fails', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValue(session)
    getProductsMock.mockResolvedValue([])
    vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage unavailable') })
    render(<App />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('密碼'), 'Password123')
    await user.click(within(screen.getByRole('form', { name: '登入表單' })).getByRole('button', { name: '登入' }))
    expect(await screen.findByText('目前無產品')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument()
    expect(window.alert).toHaveBeenCalledWith('登入狀態無法保存；重新整理後需要重新登入')
  })

  it('clears an expired restored session and returns to login', async () => {
    sessionStorage.setItem('manage-frontend.auth-session', JSON.stringify(session))
    getProductsMock.mockRejectedValue(new AuthServiceError('unauthorized', 'expired'))
    vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    render(<App />)
    expect(await screen.findByRole('form', { name: '登入表單' })).toBeInTheDocument()
    expect(sessionStorage.getItem('manage-frontend.auth-session')).toBeNull()
    expect(window.alert).toHaveBeenCalledWith('登入已逾期，請重新登入')
  })

  it.each(['http', 'network'] as const)('keeps the session after a non-401 %s product failure', async (kind) => {
    sessionStorage.setItem('manage-frontend.auth-session', JSON.stringify(session))
    getProductsMock.mockRejectedValue(new AuthServiceError(kind, 'products unavailable'))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('products unavailable')
    expect(sessionStorage.getItem('manage-frontend.auth-session')).toBe(JSON.stringify(session))
    expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument()
  })

  it('returns to login and cancels product loading as soon as logout begins', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem('manage-frontend.auth-session', JSON.stringify(session))
    let finishLogout!: () => void
    logoutMock.mockReturnValue(new Promise<void>((resolve) => { finishLogout = resolve }))
    getProductsMock.mockReturnValue(new Promise(() => undefined))
    vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    render(<App />)
    const logoutButton = await screen.findByRole('button', { name: '登出' })
    const productSignal = getProductsMock.mock.calls[0]?.[1]
    await user.click(logoutButton)
    expect(await screen.findByRole('form', { name: '登入表單' })).toBeInTheDocument()
    expect(sessionStorage.getItem('manage-frontend.auth-session')).toBeNull()
    expect(productSignal?.aborted).toBe(true)
    fireEvent.click(logoutButton)
    expect(logoutMock).toHaveBeenCalledOnce()
    await act(async () => finishLogout())
  })

  it('returns to login even when logout fails', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem('manage-frontend.auth-session', JSON.stringify(session))
    getProductsMock.mockResolvedValue([])
    logoutMock.mockRejectedValue(new Error('offline'))
    vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    render(<App />)
    await screen.findByText('目前無產品')
    await user.click(screen.getByRole('button', { name: '登出' }))
    expect(await screen.findByRole('form', { name: '登入表單' })).toBeInTheDocument()
    await waitFor(() => expect(sessionStorage.getItem('manage-frontend.auth-session')).toBeNull())
    expect(window.alert).toHaveBeenCalledWith('登出時發生錯誤，已返回登入頁。')
  })

  it('clears the in-memory session when sessionStorage removal fails', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem('manage-frontend.auth-session', JSON.stringify(session))
    getProductsMock.mockResolvedValue([])
    logoutMock.mockResolvedValue()
    vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('storage unavailable') })
    render(<App />)
    await screen.findByText('目前無產品')
    await user.click(screen.getByRole('button', { name: '登出' }))
    expect(await screen.findByRole('form', { name: '登入表單' })).toBeInTheDocument()
    expect(logoutMock).toHaveBeenCalledOnce()
    expect(window.alert).toHaveBeenCalledWith('本機登入資料未能清除。')
  })

  it('restores the session under StrictMode and does not expose the login page', async () => {
    sessionStorage.setItem('manage-frontend.auth-session', JSON.stringify(session))
    getProductsMock.mockResolvedValue([])
    render(<StrictMode><App /></StrictMode>)
    expect(await screen.findByText('目前無產品')).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: '登入表單' })).not.toBeInTheDocument()
    expect(sessionStorage.getItem('manage-frontend.auth-session')).toBe(JSON.stringify(session))
  })
})

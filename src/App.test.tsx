import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { getProducts } from './services/product-service'
import { logoutUser } from './services/auth-service'

vi.mock('./services/product-service', () => ({ getProducts: vi.fn() }))
vi.mock('./services/auth-service', () => ({
  AuthServiceError: class AuthServiceError extends Error { kind: string; constructor(kind: string, message: string) { super(message); this.kind = kind } },
  logoutUser: vi.fn(),
  loginUser: vi.fn(),
}))

const session = { uid: 'u1', authorization: 'token', userName: 'Tester' }
const getProductsMock = vi.mocked(getProducts)
const logoutMock = vi.mocked(logoutUser)

afterEach(() => {
  sessionStorage.clear()
  getProductsMock.mockReset()
  logoutMock.mockReset()
})

describe('App session flow', () => {
  it('restores session after reload and loads products without logging in again', async () => {
    sessionStorage.setItem('manage-frontend.auth-session', JSON.stringify(session))
    getProductsMock.mockResolvedValue([])
    render(<App />)
    expect(await screen.findByText('目前無產品')).toBeInTheDocument()
    expect(getProductsMock).toHaveBeenCalledWith(session, expect.any(AbortSignal))
    expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument()
  })

  it('clears session and returns to login even when logout fails', async () => {
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
  })
})

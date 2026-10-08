import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SiteHeader } from './SiteHeader'

describe('SiteHeader', () => {
  it('uses shared buttons for permission and logout actions', () => {
    const onPermissions = vi.fn()
    const onLogout = vi.fn()
    render(<SiteHeader authenticated activePage="products" onPermissions={onPermissions} onLogout={onLogout} />)

    expect(screen.getByText('商品管理')).toHaveClass('site-header__active')
    fireEvent.click(screen.getByRole('button', { name: '權限管理' }))
    fireEvent.click(screen.getByRole('button', { name: '登出' }))
    expect(onPermissions).toHaveBeenCalledOnce()
    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('does not render authenticated navigation on the auth page', () => {
    render(<SiteHeader authenticated={false} activePage="auth" />)
    expect(screen.queryByRole('navigation', { name: '主要導覽' })).not.toBeInTheDocument()
    expect(screen.getByText('TAMAS')).toBeInTheDocument()
  })
})

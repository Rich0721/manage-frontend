import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('defaults to a non-submitting button and forwards a selected type', () => {
    const { rerender } = render(<Button>一般操作</Button>)
    expect(screen.getByRole('button', { name: '一般操作' })).toHaveAttribute('type', 'button')
    rerender(<Button type="submit">送出</Button>)
    expect(screen.getByRole('button', { name: '送出' })).toHaveAttribute('type', 'submit')
  })

  it('does not fire while disabled and applies page layout classes', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick} className="product-toolbar__action">加入商品</Button>)
    const button = screen.getByRole('button', { name: '加入商品' })
    expect(button).toHaveClass('button--primary', 'product-toolbar__action')
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders navigation as a native link with its target URL', () => {
    render(<Button href="/future-page" variant="secondary">前往頁面</Button>)
    expect(screen.getByRole('link', { name: '前往頁面' })).toHaveAttribute('href', '/future-page')
  })

  it('forwards accessibility attributes to its native element', () => {
    const { rerender } = render(<Button aria-label="開啟選單">開啟</Button>)
    expect(screen.getByRole('button', { name: '開啟選單' })).toBeInTheDocument()
    rerender(<Button href="/products" aria-label="查看商品">商品</Button>)
    expect(screen.getByRole('link', { name: '查看商品' })).toHaveAttribute('href', '/products')
  })
})

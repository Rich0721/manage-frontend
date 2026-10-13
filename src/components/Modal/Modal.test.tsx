import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  it('provides dialog semantics and closes with Escape when idle', () => {
    const onClose = vi.fn()
    render(<Modal title="刪除商品" onClose={onClose}><button type="button">確認</button></Modal>)
    expect(screen.getByRole('dialog', { name: '刪除商品' })).toHaveAttribute('aria-modal', 'true')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('keeps an in-flight modal open on Escape', () => {
    const onClose = vi.fn()
    render(<Modal title="新增商品" onClose={onClose} busy><button type="button">確認</button></Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})

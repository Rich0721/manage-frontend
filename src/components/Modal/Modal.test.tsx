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

  it('moves focus into the dialog, traps tab navigation, and restores focus on close', () => {
    const trigger = document.createElement('button')
    trigger.textContent = '開啟視窗'
    document.body.append(trigger)
    trigger.focus()
    const view = render(<Modal title="刪除商品" onClose={() => undefined}>
      <button type="button">第一個</button>
      <button type="button">最後一個</button>
    </Modal>)
    const first = screen.getByRole('button', { name: '第一個' })
    const last = screen.getByRole('button', { name: '最後一個' })
    expect(first).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(first).toHaveFocus()
    view.unmount()
    expect(trigger).toHaveFocus()
    trigger.remove()
  })
})

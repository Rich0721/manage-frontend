import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { SellAmountPanel } from './SellAmountPanel'

function setup(overrides: Partial<ComponentProps<typeof SellAmountPanel>> = {}) {
  const props = {
    totalAmount: 300,
    adjustedTotal: '300',
    disabled: false,
    busy: false,
    message: '',
    onProductId: vi.fn(),
    onAdjustedTotalChange: vi.fn(),
    onCheckout: vi.fn(),
    onClear: vi.fn(),
    ...overrides,
  }
  render(<SellAmountPanel {...props} />)
  return props
}

describe('SellAmountPanel', () => {
  it('submits a product lookup once after 13 characters and displays the total read-only', async () => {
    const user = userEvent.setup()
    const props = setup()
    await user.type(screen.getByRole('textbox', { name: '商品ID' }), '1000000000001')
    expect(props.onProductId).toHaveBeenCalledExactlyOnceWith('1000000000001')
    expect(screen.getByRole('textbox', { name: '總價格' })).toHaveValue('300')
    expect(screen.getByRole('textbox', { name: '總價格' })).toHaveAttribute('readonly')
  })

  it('commits a positive whole adjusted total and restores invalid values', async () => {
    const user = userEvent.setup()
    const props = setup()
    const input = screen.getByRole('textbox', { name: '整單調整價格' })
    await user.clear(input)
    await user.type(input, '400')
    fireEvent.blur(input)
    expect(props.onAdjustedTotalChange).toHaveBeenCalledWith('400')

    await user.clear(input)
    await user.type(input, '1.5')
    fireEvent.blur(input)
    expect(input).toHaveValue('300')
    expect(props.onAdjustedTotalChange).toHaveBeenCalledOnce()
  })

  it.each(['0', '-1', 'abc'])('restores invalid adjusted total %s without notifying the page', async (value) => {
    const user = userEvent.setup()
    const props = setup()
    const input = screen.getByRole('textbox', { name: '整單調整價格' })
    await user.clear(input)
    await user.type(input, value)
    fireEvent.blur(input)

    expect(input).toHaveValue('300')
    expect(props.onAdjustedTotalChange).not.toHaveBeenCalled()
  })

  it('disables amount and checkout controls when there are no products and wires the buttons', async () => {
    const user = userEvent.setup()
    const props = setup({ totalAmount: 0, adjustedTotal: '0', disabled: true })
    expect(screen.getByRole('textbox', { name: '整單調整價格' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '結帳' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '清空' }))
    expect(props.onClear).toHaveBeenCalledOnce()
    expect(props.onCheckout).not.toHaveBeenCalled()
  })

  it('wires checkout', async () => {
    const user = userEvent.setup()
    const props = setup()
    await user.click(screen.getByRole('button', { name: '結帳' }))
    expect(props.onCheckout).toHaveBeenCalledOnce()
  })

  it('disables checkout while a product lookup is pending', () => {
    setup({ lookupBusy: true })
    expect(screen.getByRole('button', { name: '結帳' })).toBeDisabled()
  })
})

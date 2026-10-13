import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductLabelInput } from './ProductLabelInput'

describe('ProductLabelInput', () => {
  it('filters existing labels without case sensitivity and selects one on Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ProductLabelInput value={[]} options={['Blue', 'Red']} onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: '商品分類' })
    await user.type(input, 'bL')
    expect(screen.getByRole('button', { name: 'Blue' })).toBeInTheDocument()
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(['Blue'])
  })

  it('adds a new text label, rejects commas, and clears all selected labels', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ProductLabelInput value={['Old']} options={[]} onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: '商品分類' })
    await user.type(input, 'Fresh')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(['Old', 'Fresh'])
    await user.clear(input)
    await user.type(input, 'Bad,Label')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alert')).toHaveTextContent('分類名稱不能包含逗號')
    await user.click(screen.getByRole('button', { name: '清除所有分類' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })
})

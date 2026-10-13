import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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

  it('renders the same Figma tag template when adding by Enter or suggestion', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(<ProductLabelInput value={[]} options={['Suggested']} onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: '商品分類' })
    await user.type(input, 'Typed new')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenLastCalledWith(['Typed new'])
    rerender(<ProductLabelInput value={['Typed new']} options={['Suggested']} onChange={onChange} />)
    expect(document.querySelector('.product-label-input__tag')).toHaveTextContent('Typed new')
    expect(screen.getByRole('button', { name: '移除分類 Typed new' }).querySelector('img')).toHaveAttribute('src', '/icon/label-close.png')

    rerender(<ProductLabelInput value={[]} options={['Suggested']} onChange={onChange} />)
    await user.type(screen.getByRole('textbox', { name: '商品分類' }), 'Sug')
    await user.click(screen.getByRole('button', { name: 'Suggested' }))
    expect(onChange).toHaveBeenLastCalledWith(['Suggested'])
    rerender(<ProductLabelInput value={['Suggested']} options={['Suggested']} onChange={onChange} />)
    const tag = document.querySelector('.product-label-input__tag')
    expect(tag).toHaveTextContent('Suggested')
    expect(tag).toHaveClass('product-label-input__tag')
    expect(screen.getByRole('button', { name: '移除分類 Suggested' }).querySelector('img')).toHaveAttribute('src', '/icon/label-close.png')
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

  it('does not commit a label when Enter is part of an IME composition', () => {
    const onChange = vi.fn()
    render(<ProductLabelInput value={[]} options={[]} onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: '商品分類' })
    fireEvent.change(input, { target: { value: '分類' } })
    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('分類')
  })

  it('removes only the selected label requested by its x button', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ProductLabelInput value={['A', 'B']} options={[]} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '移除分類 A' }))
    expect(onChange).toHaveBeenCalledWith(['B'])
  })
})

import { useState, type KeyboardEvent } from 'react'
import './ProductLabelInput.css'

interface ProductLabelInputProps {
  value: string[]
  options: string[]
  onChange: (labels: string[]) => void
  error?: string
}

export function ProductLabelInput({ value, options, onChange, error }: ProductLabelInputProps) {
  const [draft, setDraft] = useState('')
  const [composing, setComposing] = useState(false)
  const matches = draft.trim()
    ? options.filter((label) => label.toLocaleLowerCase().includes(draft.trim().toLocaleLowerCase()) && !value.includes(label))
    : []

  const add = (label: string) => {
    const next = label.trim()
    if (!next || next.includes(',') || value.some((existing) => existing.toLocaleLowerCase() === next.toLocaleLowerCase())) return
    onChange([...value, next])
    setDraft('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || composing || event.nativeEvent.isComposing) return
    event.preventDefault()
    add(matches[0] ?? draft)
  }

  return (
    <div className="product-label-input">
      <div className={`product-label-input__control${error ? ' product-label-input__control--error' : ''}`}>
        <div className="product-label-input__tags">
          {value.map((label) => (
            <span className="product-label-input__tag" key={label}>
              <span>{label}</span>
              <button type="button" aria-label={`移除分類 ${label}`} onClick={() => onChange(value.filter((item) => item !== label))}>
                <img src="/icon/label-close.png" alt="" />
              </button>
            </span>
          ))}
          <input
            aria-label="商品分類"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'product-label-error' : undefined}
          />
        </div>
        <button type="button" className="product-label-input__clear" aria-label="清除所有分類" onClick={() => { onChange([]); setDraft('') }}>×</button>
      </div>
      {matches.length > 0 ? (
        <ul className="product-label-input__options" aria-label="分類建議">
          {matches.map((label) => <li key={label}><button type="button" onClick={() => add(label)}>{label}</button></li>)}
        </ul>
      ) : null}
      {error ? <p id="product-label-error" className="product-label-input__error">{error}</p> : null}
      {draft.includes(',') ? <p className="product-label-input__error" role="alert">分類名稱不能包含逗號</p> : null}
    </div>
  )
}

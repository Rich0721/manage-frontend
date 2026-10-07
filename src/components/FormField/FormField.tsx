import type {
  InputHTMLAttributes,
  ChangeEventHandler,
  FocusEventHandler,
} from 'react'
import './FormField.css'

interface FormFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'id' | 'type' | 'value' | 'onChange' | 'onBlur'
  > {
  id: string
  label: string
  type: 'text' | 'email' | 'password'
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onBlur: FocusEventHandler<HTMLInputElement>
  error?: string
}

export function FormField({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  className,
  ...inputProps
}: FormFieldProps) {
  const errorId = `${id}-error`
  const inputClassName = [
    'form-field__input',
    error ? 'form-field__input--error' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="form-field__control">
        <input
          {...inputProps}
          id={id}
          className={inputClassName}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        {error ? (
          <p className="form-field__error" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}

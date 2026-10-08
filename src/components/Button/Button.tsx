import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'text'

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  href?: never
  variant?: ButtonVariant
  children: ReactNode
}

type AnchorButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  href: string
  type?: never
  disabled?: never
  variant?: ButtonVariant
  children: ReactNode
}

export type ButtonProps = NativeButtonProps | AnchorButtonProps

function classNames(variant: ButtonVariant, className?: string): string {
  return ['button', `button--${variant}`, className].filter(Boolean).join(' ')
}

export function Button(props: ButtonProps) {
  if ('href' in props && props.href !== undefined) {
    const { href, variant = 'primary', className, children, ...anchorProps } = props
    return <a {...anchorProps} href={href} className={classNames(variant, className)}>{children}</a>
  }

  const { variant = 'primary', className, type = 'button', children, ...buttonProps } = props
  return <button {...buttonProps} type={type} className={classNames(variant, className)}>{children}</button>
}

import './AuthTabs.css'

export type AuthMode = 'login' | 'register'

interface AuthTabsProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

export function AuthTabs({ mode, onModeChange }: AuthTabsProps) {
  return (
    <div className="auth-tabs" role="group" aria-label="登入或註冊">
      <button
        className={`auth-tabs__button${mode === 'login' ? ' auth-tabs__button--active' : ''}`}
        type="button"
        aria-pressed={mode === 'login'}
        onClick={() => onModeChange('login')}
      >
        登入
      </button>
      <button
        className={`auth-tabs__button${mode === 'register' ? ' auth-tabs__button--active' : ''}`}
        type="button"
        aria-pressed={mode === 'register'}
        onClick={() => onModeChange('register')}
      >
        註冊
      </button>
    </div>
  )
}

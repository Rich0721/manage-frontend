import { useEffect, useRef, useState } from 'react'
import type {
  ChangeEvent,
  FocusEvent,
  FormEvent,
} from 'react'
import { AuthTabs } from '../components/AuthTabs/AuthTabs'
import type { AuthMode } from '../components/AuthTabs/AuthTabs'
import { LoginForm } from '../components/LoginForm/LoginForm'
import { RegisterForm } from '../components/RegisterForm/RegisterForm'
import { registerUser, RegisterServiceError } from '../services/register-service'
import { loginUser, AuthServiceError } from '../services/auth-service'
import type { AuthSession, LoginFieldName, LoginFormValues, LoginValidationErrors } from '../types/auth'
import { normalizeLoginForm, validateLoginForm } from './auth-validation'
import { SiteHeader } from '../components/SiteHeader/SiteHeader'
import type {
  RegisterFieldName,
  RegisterFormValues,
  RegisterValidationErrors,
} from '../types/register'
import { normalizeRegisterForm, validateRegisterForm } from './register-validation'
import './HomePage.css'

const EMPTY_REGISTER_VALUES: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const EMPTY_LOGIN_VALUES = { email: '', password: '' }
const ALL_FIELDS: RegisterFieldName[] = [
  'name',
  'email',
  'password',
  'confirmPassword',
]

interface HomePageProps {
  initialMode?: AuthMode
  onLoginSuccess?: (session: AuthSession) => void
}

export function HomePage({ initialMode = 'login', onLoginSuccess }: HomePageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [registerValues, setRegisterValues] =
    useState<RegisterFormValues>(EMPTY_REGISTER_VALUES)
  const [loginValues, setLoginValues] = useState<LoginFormValues>(EMPTY_LOGIN_VALUES)
  const [loginTouched, setLoginTouched] = useState<Partial<Record<LoginFieldName, boolean>>>({})
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [loginSubmitErrors, setLoginSubmitErrors] = useState<LoginValidationErrors>({})
  const [touched, setTouched] = useState<Partial<Record<RegisterFieldName, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitErrors, setSubmitErrors] = useState<RegisterValidationErrors>({})
  const requestIdRef = useRef(0)
  const activeControllerRef = useRef<AbortController | null>(null)
  const requestLockedRef = useRef(false)

  const validationErrors = validateRegisterForm(registerValues)
  const visibleErrors = ALL_FIELDS.reduce<RegisterValidationErrors>(
    (errors, fieldName) => {
      const message = touched[fieldName]
        ? validationErrors[fieldName] ?? submitErrors[fieldName]
        : undefined
      if (message) errors[fieldName] = message
      return errors
    },
    {},
  )
  const canSubmit = Object.keys(validationErrors).length === 0
  const loginErrors = validateLoginForm(loginValues)
  const visibleLoginErrors = Object.fromEntries(Object.entries(loginErrors).filter(([field]) => loginTouched[field as LoginFieldName])) as LoginValidationErrors

  function clearForms(): void {
    setRegisterValues(EMPTY_REGISTER_VALUES)
    setLoginValues(EMPTY_LOGIN_VALUES)
    setLoginTouched({})
    setLoginSubmitErrors({})
    setTouched({})
    setSubmitErrors({})
    setSubmitting(false)
  }

  function cancelRequest(): void {
    requestIdRef.current += 1
    activeControllerRef.current?.abort()
    activeControllerRef.current = null
    requestLockedRef.current = false
  }

  function handleModeChange(nextMode: AuthMode): void {
    if (nextMode === mode) return
    cancelRequest()
    clearForms()
    setMode(nextMode)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.currentTarget

    if (mode === 'login') {
      if (name === 'email' || name === 'password') {
        setLoginValues((previous) => ({ ...previous, [name]: value }))
        setLoginSubmitErrors((previous) => ({ ...previous, [name]: undefined }))
      }
      return
    }

    if (!ALL_FIELDS.includes(name as RegisterFieldName)) return
    const fieldName = name as RegisterFieldName
    setRegisterValues((previous) => ({ ...previous, [fieldName]: value }))
    setSubmitErrors((previous) => ({ ...previous, [fieldName]: undefined }))
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>): void {
    const { name } = event.currentTarget
    if (mode === 'login') {
      if (name !== 'email' && name !== 'password') return
      setLoginValues((previous) => ({ ...previous, [name]: previous[name].trim() }))
      setLoginTouched((previous) => ({ ...previous, [name]: true }))
      return
    }
    if (!ALL_FIELDS.includes(name as RegisterFieldName)) return

    const fieldName = name as RegisterFieldName
    setRegisterValues((previous) => ({
      ...previous,
      [fieldName]: previous[fieldName].trim(),
    }))
    setTouched((previous) => ({ ...previous, [fieldName]: true }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (requestLockedRef.current) return

    if (mode === 'login') {
      const snapshot = normalizeLoginForm(loginValues)
      const errors = validateLoginForm(snapshot)
      setLoginValues(snapshot)
      setLoginTouched({ email: true, password: true })
      setLoginSubmitErrors(errors)
      if (Object.keys(errors).length > 0) return
      requestLockedRef.current = true
      setLoginSubmitting(true)
      const controller = new AbortController()
      const requestId = ++requestIdRef.current
      activeControllerRef.current = controller
      try {
        const session = await loginUser(snapshot, controller.signal)
        if (requestIdRef.current === requestId) onLoginSuccess?.(session)
      } catch (error: unknown) {
        if (requestIdRef.current !== requestId || controller.signal.aborted) return
        const message = error instanceof AuthServiceError
          ? error.kind === 'timeout' ? '連線逾時，請稍後再試'
            : error.kind === 'protocol' ? '伺服器回應異常，請稍後再試'
              : error.message
          : '連線異常，請稍後再試'
        window.alert(message)
      } finally {
        if (requestIdRef.current === requestId) {
          requestLockedRef.current = false
          activeControllerRef.current = null
          setLoginSubmitting(false)
        }
      }
      return
    }

    const snapshot = normalizeRegisterForm(registerValues)
    const errors = validateRegisterForm(snapshot)
    setRegisterValues(snapshot)
    setTouched(Object.fromEntries(ALL_FIELDS.map((field) => [field, true])))
    setSubmitErrors(errors)
    if (Object.keys(errors).length > 0) return

    requestLockedRef.current = true
    const controller = new AbortController()
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    activeControllerRef.current = controller
    setSubmitting(true)

    try {
      const result = await registerUser(snapshot, controller.signal)
      if (requestIdRef.current !== requestId) return

      if (result.status === 'success') {
        window.alert(result.message || '註冊成功')
        if (requestIdRef.current === requestId) handleModeChange('login')
      } else {
        window.alert(result.message)
      }
    } catch (error) {
      if (requestIdRef.current !== requestId || controller.signal.aborted) return
      if (error instanceof RegisterServiceError && error.kind === 'timeout') {
        window.alert('連線異常，請稍後再試')
      } else if (error instanceof RegisterServiceError && error.kind === 'http') {
        window.alert(error.message)
      } else if (error instanceof RegisterServiceError && error.kind === 'protocol') {
        window.alert('伺服器回應異常，請稍後再試')
      } else {
        window.alert('連線異常，請稍後再試')
      }
    } finally {
      if (requestIdRef.current === requestId) {
        requestLockedRef.current = false
        activeControllerRef.current = null
        setSubmitting(false)
      }
    }
  }

  useEffect(() => {
    const handlePageHide = () => cancelRequest()
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        cancelRequest()
        clearForms()
      }
    }

    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('pageshow', handlePageShow)
      cancelRequest()
    }
  }, [])

  return (
    <main className="home-page">
      <SiteHeader authenticated={false} activePage="auth" />

      <section className={`auth-panel auth-panel--${mode}`} aria-label="使用者登入與註冊">
        <AuthTabs mode={mode} onModeChange={handleModeChange} />
        {mode === 'register' ? (
          <RegisterForm
            values={registerValues}
            errors={visibleErrors}
            submitting={submitting}
            canSubmit={canSubmit}
            onChange={handleChange}
            onBlur={handleBlur}
            onSubmit={handleSubmit}
          />
        ) : (
          <LoginForm
            values={loginValues}
            errors={{ ...visibleLoginErrors, ...loginSubmitErrors }}
            submitting={loginSubmitting}
            canSubmit={Object.keys(loginErrors).length === 0}
            onChange={handleChange}
            onBlur={handleBlur}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </main>
  )
}

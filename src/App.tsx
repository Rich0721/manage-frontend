import { useCallback, useEffect, useRef, useState } from 'react'
import { HomePage } from './pages/HomePage'
import { ProductPage } from './pages/ProductPage'
import { AuthServiceError, logoutUser } from './services/auth-service'
import type { AuthSession } from './types/auth'

const SESSION_KEY = 'manage-frontend.auth-session'

function removeStoredSession(): boolean {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    return true
  } catch {
    return false
  }
}

function parseSession(value: string | null): AuthSession | null {
  if (!value) return null
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null) return null
    if (!('uid' in parsed) || typeof parsed.uid !== 'string' || !parsed.uid.trim() ||
      !('authorization' in parsed) || typeof parsed.authorization !== 'string' || !parsed.authorization.trim() ||
      !('userName' in parsed) || typeof parsed.userName !== 'string') return null
    return { uid: parsed.uid, authorization: parsed.authorization, userName: parsed.userName }
  } catch { return null }
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [initialized, setInitialized] = useState(false)
  const logoutInProgressRef = useRef(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      const restored = parseSession(stored)
      if (restored) setSession(restored)
      else if (stored && !removeStoredSession()) window.alert('無法清除無效的登入狀態，請重新登入')
    } catch {
      setSession(null)
      window.alert('無法讀取登入狀態，請重新登入')
    }
    setInitialized(true)
  }, [])

  const handleLoginSuccess = useCallback((next: AuthSession) => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)) }
    catch { window.alert('登入狀態無法保存；重新整理後需要重新登入') }
    setSession(next)
  }, [])

  const handleSessionExpired = useCallback(() => {
    const cleared = removeStoredSession()
    setSession(null)
    window.alert(cleared
      ? '登入已逾期，請重新登入'
      : '登入已逾期，請重新登入；本機登入資料未能清除')
  }, [])

  const handleLogout = useCallback(async () => {
    if (!session || logoutInProgressRef.current) return
    logoutInProgressRef.current = true
    const activeSession = session
    const cleared = removeStoredSession()
    setSession(null)
    const controller = new AbortController()
    let message = cleared ? '' : '本機登入資料未能清除。'
    try { await logoutUser(activeSession, controller.signal) }
    catch (error: unknown) {
      message += error instanceof AuthServiceError
        ? '登出未成功，已返回登入頁。'
        : '登出時發生錯誤，已返回登入頁。'
    } finally {
      setSession(null)
      logoutInProgressRef.current = false
      if (message) window.alert(message)
    }
  }, [session])

  if (!initialized) return <main aria-busy="true" />
  return session
    ? <ProductPage session={session} onLogout={() => { void handleLogout() }} onSessionExpired={handleSessionExpired} />
    : <HomePage initialMode="login" onLoginSuccess={handleLoginSuccess} />
}

export default App

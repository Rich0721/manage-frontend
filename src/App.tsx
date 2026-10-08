import { useCallback, useEffect, useState } from 'react'
import { HomePage } from './pages/HomePage'
import { ProductPage } from './pages/ProductPage'
import { AuthServiceError, logoutUser } from './services/auth-service'
import type { AuthSession } from './types/auth'

const SESSION_KEY = 'manage-frontend.auth-session'

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

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      const restored = parseSession(stored)
      if (restored) setSession(restored)
      else if (stored) sessionStorage.removeItem(SESSION_KEY)
    } catch { setSession(null) }
    setInitialized(true)
  }, [])

  const handleLoginSuccess = useCallback((next: AuthSession) => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)) }
    catch { window.alert('登入狀態無法保存；重新整理後需要重新登入') }
    setSession(next)
  }, [])

  const handleSessionExpired = useCallback(() => {
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* state must still be cleared */ }
    setSession(null)
    window.alert('登入已逾期，請重新登入')
  }, [])

  const handleLogout = useCallback(async () => {
    if (!session) return
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* continue logout */ }
    const controller = new AbortController()
    try { await logoutUser(session, controller.signal) }
    catch (error: unknown) {
      window.alert(error instanceof AuthServiceError ? '登出未成功，已清除本機登入狀態' : '登出時發生錯誤，已清除本機登入狀態')
    } finally { setSession(null) }
  }, [session])

  if (!initialized) return <main aria-busy="true" />
  return session
    ? <ProductPage session={session} onLogout={() => { void handleLogout() }} onSessionExpired={handleSessionExpired} />
    : <HomePage initialMode="login" onLoginSuccess={handleLoginSuccess} />
}

export default App

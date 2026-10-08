import './SiteHeader.css'
import { Button } from '../Button/Button'

interface SiteHeaderProps {
  authenticated: boolean
  onLogout?: () => void
  onPermissions?: () => void
  activePage: 'auth' | 'products'
}

export function SiteHeader({ authenticated, onLogout, onPermissions, activePage }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <span className="site-header__brand">TAMAS</span>
      {authenticated ? (
        <nav className="site-header__nav" aria-label="主要導覽">
          <span className={activePage === 'products' ? 'site-header__active' : ''}>商品管理</span>
          <Button variant="text" className="site-header__permissions" onClick={onPermissions}>權限管理</Button>
          <Button className="site-header__logout" onClick={onLogout}>登出</Button>
        </nav>
      ) : null}
    </header>
  )
}

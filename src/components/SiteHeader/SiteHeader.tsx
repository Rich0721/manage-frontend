import './SiteHeader.css'
import { Button } from '../Button/Button'

interface SiteHeaderProps {
  authenticated: boolean
  onLogout?: () => void
  onPermissions?: () => void
  onNavigateProducts?: () => void
  onNavigateSell?: () => void
  activePage: 'auth' | 'products' | 'sell'
}

export function SiteHeader({ authenticated, onLogout, onPermissions, onNavigateProducts, onNavigateSell, activePage }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <span className="site-header__brand">TAMAS</span>
      {authenticated ? (
        <nav className="site-header__nav" aria-label="主要導覽">
          <Button variant="text" className={activePage === 'products' ? 'site-header__active' : ''} onClick={onNavigateProducts}>商品管理</Button>
          <Button variant="text" className={activePage === 'sell' ? 'site-header__active' : ''} onClick={onNavigateSell}>商品販售</Button>
          <Button variant="text" className="site-header__permissions" onClick={onPermissions}>權限管理</Button>
          <Button className="site-header__logout" onClick={onLogout}>登出</Button>
        </nav>
      ) : null}
    </header>
  )
}

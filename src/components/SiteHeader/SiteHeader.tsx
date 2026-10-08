import './SiteHeader.css'

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
          <button type="button" onClick={onPermissions}>權限管理</button>
          <button type="button" onClick={onLogout}>登出</button>
        </nav>
      ) : null}
    </header>
  )
}

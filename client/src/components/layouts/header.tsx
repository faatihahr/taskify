import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Moon, Sun, Menu, X, LogOut, ChevronLeft, Layout } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/authSlice'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="bg-card/95 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with Back Button */}
          <div className="flex items-center gap-3">
            {/* Back Button - Only show on All Boards page */}
            {user && location.pathname === '/boards' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 p-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden md:inline">Back</span>
              </Button>
            )}

            <a href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg gradient-purple flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg md:text-xl">T</span>
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Taskify
              </span>
            </a>
          </div>

          {/* Desktop Navigation - Hidden when logged in */}
          {!user && (
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-foreground/70 hover:text-primary font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-foreground/70 hover:text-primary font-medium transition-colors"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-foreground/70 hover:text-primary font-medium transition-colors"
              >
                About
              </a>
            </nav>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {!user ? (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="gradient-purple text-white">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" className="flex items-center space-x-2">
                  <Link to="/templates">
                    <Layout className="h-4 w-4" />
                    <span className="hidden sm:inline">Templates</span>
                  </Link>
                </Button>
                <span className="text-sm font-medium">{user.name}</span>
                <Button onClick={handleLogout} variant="ghost" className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="rounded-full"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in border-t border-border/50">
            {!user && (
              <nav className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-foreground/70 hover:text-primary font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-foreground/70 hover:text-primary font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <a
                  href="#about"
                  className="text-foreground/70 hover:text-primary font-medium transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
              </nav>
            )}
            <div className="flex flex-col space-y-2 pt-4">
              {!user ? (
                <>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full gradient-purple text-white">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{user.name}</span>
                    <Button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="ml-2" variant="ghost">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <Button asChild variant="outline" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/templates" className="flex items-center space-x-2">
                        <Layout className="h-4 w-4" />
                        <span>Templates</span>
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

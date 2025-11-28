import React from 'react'
import { Button } from '../ui/button'

const Header: React.FC = () => {
  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-xl font-bold text-primary">
            Taskify
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <a href="/login">Login</a>
            </Button>
            <Button asChild size="sm">
              <a href="/register">Get Started</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

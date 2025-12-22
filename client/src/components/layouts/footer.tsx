import React from 'react'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container-custom">
        <div className="py-12 md:py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-lg gradient-purple flex items-center justify-center">
                <span className="text-white font-bold text-xl">DIA</span>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Do It Anytime
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
              Simplify your workflow with collaborative task management designed for modern teams. Boost productivity and achieve more together.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © 2025 DIA. Do It Anytime. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Developed by Faatihah Rahmatillah & Karina Gayatri Gozal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

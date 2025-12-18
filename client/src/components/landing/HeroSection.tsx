import React from 'react'
import { Button } from '../ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

const HeroSection: React.FC = () => {
  return (
    <section className="relative px-4 py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Trusted by 10,000+ teams worldwide
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Simplify Your
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"> Workflow</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Taskify is your collaborative task management solution. Organize projects, track progress, and boost productivity with our intuitive Kanban boards.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="gradient-purple text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transform hover:scale-105 transition-all"
            >
              <a href="/register" className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-lg font-semibold border-2 hover:border-primary/50"
            >
              <a href="/login">Sign In</a>
            </Button>
          </div>

          {/* Demo Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="glass-effect rounded-2xl p-6 md:p-10 shadow-2xl border-2 border-border/50 transform hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  Project Dashboard
                </h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* To Do Column */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20 hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-primary text-lg">To Do</div>
                    <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                      5
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-card p-3 rounded-lg shadow-sm border border-border/50">
                      <div className="text-sm font-medium text-foreground">Design homepage</div>
                    </div>
                    <div className="bg-card p-3 rounded-lg shadow-sm border border-border/50">
                      <div className="text-sm font-medium text-foreground">API integration</div>
                    </div>
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="bg-gradient-to-br from-yellow-100/30 to-yellow-50/20 dark:from-yellow-500/10 dark:to-yellow-400/5 rounded-xl p-5 border border-yellow-300/30 dark:border-yellow-400/20 hover:border-yellow-400/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-yellow-700 dark:text-yellow-400 text-lg">In Progress</div>
                    <div className="px-3 py-1 rounded-full bg-yellow-200/50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm font-semibold">
                      2
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-card p-3 rounded-lg shadow-sm border border-border/50">
                      <div className="text-sm font-medium text-foreground">User testing</div>
                    </div>
                  </div>
                </div>

                {/* Done Column */}
                <div className="bg-gradient-to-br from-green-100/30 to-green-50/20 dark:from-green-500/10 dark:to-green-400/5 rounded-xl p-5 border border-green-300/30 dark:border-green-400/20 hover:border-green-400/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-green-700 dark:text-green-400 text-lg">Done</div>
                    <div className="px-3 py-1 rounded-full bg-green-200/50 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-sm font-semibold">
                      8
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-card p-3 rounded-lg shadow-sm border border-border/50">
                      <div className="text-sm font-medium text-foreground">Setup project</div>
                    </div>
                    <div className="bg-card p-3 rounded-lg shadow-sm border border-border/50">
                      <div className="text-sm font-medium text-foreground">Database schema</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
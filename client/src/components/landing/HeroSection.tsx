import React from 'react'
import { Button } from '../ui/button'
import { ArrowRight } from 'lucide-react'

const HeroSection: React.FC = () => {
  return (
    <section className="px-4 py-12 md:py-20 lg:py-24">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          Simplify Your Workflow
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Taskify is your collaborative task management solution. Organize projects, track progress, and boost productivity with our intuitive Kanban boards.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="px-8 py-3 text-lg font-medium">
            <a href="/register">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-3 text-lg">
            <a href="/login">Login</a>
          </Button>
        </div>

        {/* Demo visual */}
        <div className="mt-12 md:mt-16">
          <div className="bg-card border rounded-lg p-6 md:p-8 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Project Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded p-4">
                <div className="font-semibold text-primary">To Do</div>
                <div className="text-sm text-muted-foreground mt-1">5 tasks</div>
              </div>
              <div className="bg-yellow-100 rounded p-4">
                <div className="font-semibold text-yellow-800">In Progress</div>
                <div className="text-sm text-muted-foreground mt-1">2 tasks</div>
              </div>
              <div className="bg-green-100 rounded p-4">
                <div className="font-semibold text-green-800">Done</div>
                <div className="text-sm text-muted-foreground mt-1">8 tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

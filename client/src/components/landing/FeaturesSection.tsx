import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CheckCircle, Users, Zap, Eye, TrendingUp, Shield } from 'lucide-react'

const features = [
  {
    icon: <CheckCircle className="h-7 w-7" />,
    title: 'Visual Kanban Boards',
    description: 'Organize your tasks with intuitive drag-and-drop boards that visualize your workflow at a glance.',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    icon: <Users className="h-7 w-7" />,
    title: 'Team Collaboration',
    description: 'Work together seamlessly. Invite team members, assign tasks, and track progress in real-time.',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: 'Lightning Fast',
    description: 'Move tasks between lists effortlessly with our smooth drag-and-drop interface designed for speed.',
    color: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    icon: <Eye className="h-7 w-7" />,
    title: 'Dashboard Insights',
    description: 'Get comprehensive insights into your projects with powerful dashboards and progress tracking.',
    color: 'text-green-600 dark:text-green-400'
  },
  {
    icon: <TrendingUp className="h-7 w-7" />,
    title: 'Analytics & Reports',
    description: 'Track team performance and project metrics with detailed analytics and custom reports.',
    color: 'text-orange-600 dark:text-orange-400'
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: 'Secure & Private',
    description: 'Your data is encrypted and secure with enterprise-grade security and privacy protection.',
    color: 'text-red-600 dark:text-red-400'
  }
]

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="px-4 py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-semibold text-primary">Features</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Powerful features designed to help teams organize, collaborate, and deliver projects faster than ever before.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/30"
            >
              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 p-4 bg-linear-to-br from-primary/10 to-primary/5 rounded-2xl w-fit group-hover:scale-110 transition-transform ${feature.color}`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl md:text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="glass-effect rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-5xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                10k+
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                Active Users
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-5xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                50k+
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                Tasks Managed
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-5xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                500+
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                Teams Using
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-5xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                99.9%
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                Uptime
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
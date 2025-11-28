import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CheckCircle, Users, Zap, Eye } from 'lucide-react'

const features = [
  {
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    title: 'Visual Kanban Boards',
    description: 'Organize your tasks with intuitive drag-and-drop boards that visualize your workflow at a glance.'
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly. Invite team members, assign tasks, and track progress in real-time.'
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: 'Drag & Drop Interface',
    description: 'Move tasks between lists effortlessly with our smooth drag-and-drop interface designed for productivity.'
  },
  {
    icon: <Eye className="h-6 w-6 text-primary" />,
    title: 'Dashboard Overview',
    description: 'Get insights into your projects with comprehensive dashboards and progress tracking.'
  }
]

const FeaturesSection: React.FC = () => {
  return (
    <section className="px-4 py-12 md:py-20 lg:py-24 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful features designed to help teams organize, collaborate, and deliver projects faster than ever.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/5 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-bold text-primary">10k+</div>
            <div className="text-sm md:text-base text-muted-foreground">Active Users</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-primary">50k+</div>
            <div className="text-sm md:text-base text-muted-foreground">Tasks Managed</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
            <div className="text-sm md:text-base text-muted-foreground">Teams Using</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-primary">99%</div>
            <div className="text-sm md:text-base text-muted-foreground">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection

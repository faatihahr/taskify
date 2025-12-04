import React from 'react';
import { Card } from '../ui/card';
import { CheckCircle, Clock, ListChecks, AlertCircle } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => (
  <Card className="p-6 flex-1 min-w-0">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {trend && (
          <span className={`text-sm mt-1 flex items-center ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
  </Card>
);

const DashboardStats: React.FC = () => {
  // In a real app, these would come from your API/state
  const stats = [
    {
      title: 'Total Tasks',
      value: '128',
      icon: <ListChecks className="h-5 w-5" />,
      trend: { value: '12% from last week', isPositive: true },
    },
    {
      title: 'Completed',
      value: '89',
      icon: <CheckCircle className="h-5 w-5" />,
      trend: { value: '8% from last week', isPositive: true },
    },
    {
      title: 'In Progress',
      value: '24',
      icon: <Clock className="h-5 w-5" />,
      trend: { value: '3% from last week', isPositive: false },
    },
    {
      title: 'Overdue',
      value: '5',
      icon: <AlertCircle className="h-5 w-5" />,
      trend: { value: '2 from yesterday', isPositive: false },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </div>
  );
};

export default DashboardStats;

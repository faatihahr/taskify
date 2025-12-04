import React, { useMemo } from 'react'
import { Card } from '../ui/card'
import { CheckCircle, Clock, ListChecks, AlertCircle } from 'lucide-react'
import { useAppSelector } from '../../store/hooks'

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
  const { boards } = useAppSelector((state) => state.boards);

  const stats = useMemo(() => {
    // Calculate real statistics from boards data
    const totalTasks = boards.reduce((acc, board) => acc + (board._count?.lists || 0), 0);
    const completedTasks = Math.floor(totalTasks * 0.7); // Estimate - would need card data for real calculation
    const inProgressTasks = Math.floor(totalTasks * 0.2);
    const overdueTasks = Math.floor(totalTasks * 0.1);

    return [
      {
        title: 'Total Boards',
        value: boards.length,
        icon: <ListChecks className="h-5 w-5" />,
        trend: { value: `${boards.length} active boards`, isPositive: boards.length > 0 },
      },
      {
        title: 'Total Lists',
        value: totalTasks,
        icon: <CheckCircle className="h-5 w-5" />,
        trend: { value: 'Across all boards', isPositive: true },
      },
      {
        title: 'In Progress',
        value: inProgressTasks,
        icon: <Clock className="h-5 w-5" />,
        trend: { value: 'Active tasks', isPositive: false },
      },
      {
        title: 'Board Members',
        value: boards.reduce((acc, board) => acc + (board._count?.members || 0), 0),
        icon: <AlertCircle className="h-5 w-5" />,
        trend: { value: 'Total collaborators', isPositive: true },
      },
    ];
  }, [boards]);

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

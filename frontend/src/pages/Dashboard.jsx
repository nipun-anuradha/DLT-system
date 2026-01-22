import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import ModuleCard from '../components/features/ModuleCard';
import ActivityWidget from '../components/features/ActivityWidget';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'User';
  const [TicketCount, setTicketCount] = useState(0);
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard counts
        const countsResponse = await api.get('/user/tickets/dashboard/counts');
        if (countsResponse.success) {
          const tickets = (countsResponse.data.open || 0) + (countsResponse.data.inprogress || 0);
          setTicketCount(tickets);
        }

        // Fetch system notices
        const noticesResponse = await api.get('/user/notices?limit=5');
        if (noticesResponse.success) {
          const formattedNotices = noticesResponse.data.map((notice) => ({
            id: notice.id,
            title: notice.topic,
            description: notice.message,
            icon: 'campaign',
            iconColor: 'blue',
            createdAt: notice.createdAt
          }));
          setNotices(formattedNotices);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setNoticesLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

const modules = [
  {
    id: 1,
    title: 'IT Support',
    description: 'Manage tickets, view system status, and request hardware.',
    icon: 'headset_mic',
    status: 'active',
    badge: {
      icon: 'warning',
      text: `${TicketCount} Open Ticket${TicketCount !== 1 ? 's' : ''}`,
      color: 'yellow'
    },
    action: {
      text: 'Access Portal',
      enabled: true,
      link: '/tickets'
    }
  },
  {
    id: 2,
    title: 'IT',
    description: 'IT service report, infrastructure, and system monitoring',
    icon: 'computer',
    status: 'coming-soon',
    action: {
      text: 'Locked',
      icon: 'lock',
      enabled: false
    }
  },
  {
    id: 3,
    title: 'HR',
    description: 'Employee directory, leave management, and benefits.',
    icon: 'group',
    status: 'coming-soon',
    action: {
      text: 'Locked',
      icon: 'lock',
      enabled: false
    }
  },
  {
    id: 4,
    title: 'Supply Chain',
    description: 'Procurement, logistics, and supplier management.',
    icon: 'local_shipping',
    status: 'coming-soon',
    action: {
      text: 'Locked',
      icon: 'lock',
      enabled: false
    }
  },
  {
    id: 5,
    title: 'Engineering',
    description: 'Design management, technical documentation, and approvals.',
    icon: 'engineering',
    status: 'coming-soon',
    action: {
      text: 'Locked',
      icon: 'lock',
      enabled: false
    }
  },
  {
    id: 6,
    title: 'Production',
    description: 'Production planning, schedules, and output monitoring.',
    icon: 'factory',
    status: 'coming-soon',
    action: {
      text: 'Locked',
      icon: 'lock',
      enabled: false
    }
  },
  {
    id: 7,
    title: 'Stores',
    description: 'Inventory tracking, stock movements, and audits.',
    icon: 'inventory_2',
    status: 'coming-soon',
    action: {
      text: 'Locked',
      icon: 'lock',
      enabled: false
    }
  },
  {
    id: 8,
    title: 'Maintenance',
    description: 'Equipment maintenance, breakdown reports, and schedules.',
    icon: 'build',
    status: 'coming-soon',
    action: {
      text: 'Locked',
      icon: 'lock',
      enabled: false
    }
  },
  {
    id: 9,
    title: 'Finance',
    description: 'Payroll, expense claims, and financial reporting.',
    icon: 'payments',
    status: 'coming-soon',
    action: {
      text: 'Locked',
      icon: 'lock',
      enabled: false
    }
  },
  {
    id: 10,
    title: 'Quality Control',
    description: 'Inspections, quality reports, and compliance tracking.',
    icon: 'verified',
    status: 'coming-soon',
    action: {
      text: 'Locked',
      icon: 'lock',
      enabled: false
    }
  }
];

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display min-h-screen flex flex-col">
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-10 py-8 lg:py-12">
          <div className="max-w-[1440px] mx-auto">
            {/* Welcome Heading */}
            <div className="mb-12">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-slate-900 dark:text-white">
                Dashboard
              </h2>
              <p className="text-lg text-slate-600 dark:text-[#9eb7a8]">
                Welcome back, {firstName}!
              </p>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modules.map((module) => (
                <ModuleCard key={module.id} {...module} />
              ))}
            </div>

            {/* Quick Stats / Mini Dashboard Widget Area */}
            <div className="mt-12">
              <ActivityWidget activities={notices} loading={noticesLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

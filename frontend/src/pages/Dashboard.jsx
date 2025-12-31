import { useState } from 'react';
import Header from '../components/layout/Header';
import ModuleCard from '../components/features/ModuleCard';
import ActivityWidget from '../components/features/ActivityWidget';

const Dashboard = () => {
  const modules = [
    {
      id: 1,
      title: 'IT Support',
      description: 'Manage tickets, view system status, and request hardware.',
      icon: 'headset_mic',
      status: 'active',
      badge: {
        icon: 'warning',
        text: '12 Open Tickets',
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
      title: 'HR Support',
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
      id: 3,
      title: 'Finance',
      description: 'Payroll processing, expense claims, and budgeting tools.',
      icon: 'payments',
      status: 'restricted',
      action: {
        text: 'Admin Only',
        icon: 'lock_person',
        enabled: false
      }
    },
    {
      id: 4,
      title: 'Operations',
      description: 'Facility management, logistics, and supply chain.',
      icon: 'settings',
      status: 'coming-soon',
      action: {
        text: 'Locked',
        icon: 'lock',
        enabled: false
      }
    }
  ];

  const activities = [
    {
      id: 1,
      title: 'System Maintenance Scheduled',
      description: 'Nov 24, 2:00 AM - 4:00 AM',
      icon: 'update',
      iconColor: 'blue'
    },
    {
      id: 2,
      title: 'Ticket #1024 Resolved',
      description: 'Network Issue - Main Office',
      icon: 'check_circle',
      iconColor: 'primary'
    },
    {
      id: 3,
      title: 'Policy Update Required',
      description: 'Please review the new IT security policy.',
      icon: 'priority_high',
      iconColor: 'orange'
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
                Welcome back, Alex!
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
              <ActivityWidget activities={activities} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

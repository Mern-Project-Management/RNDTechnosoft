import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Mail,
  Sparkles,
  Briefcase,
  FileText,
  Inbox
} from 'lucide-react';

const inquiryTabs = [
  {
    name: 'Popup Inquiries',
    path: '/popup-inquiry',
    icon: MessageSquare,
    description: 'Popup modal leads and inquiries',
  },
  {
    name: 'Contact Inquiries',
    path: '/conatctinquiries',
    icon: Mail,
    description: 'Contact form submissions',
  },
  {
    name: 'Hero Inquiries',
    path: '/hero-inquiry',
    icon: Sparkles,
    description: 'Hero section CTA inquiries',
  },
  {
    name: 'Career Inquiries',
    path: '/careerinquiry',
    icon: Briefcase,
    description: 'Career page inquiries',
  },
  {
    name: 'Job Applications',
    path: '/application-req',
    icon: FileText,
    description: 'Job resume applications',
  },
  {
    name: 'General Inquiries',
    path: '/Inquiry',
    icon: Inbox,
    description: 'General website inquiries',
  },
];

export default function InquiryTabs() {
  const location = useLocation();

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-100 gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-blue-600" />
            All Inquiries Center
          </h2>
          <p className="text-sm text-gray-500">
            View, filter, and manage all inquiries received across every page of the website
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-3">
        {inquiryTabs.map((tab) => {
          const Icon = tab.icon;
          const currentPath = location.pathname.toLowerCase();
          const isActive = currentPath === tab.path.toLowerCase();

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-semibold'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Search,
  Bell,
  User,
  Menu,
  Sun,
  Moon,
  Mail,
} from 'lucide-react';
import { formatUSD } from '../utils/dateUtils';

interface HeaderProps {
  urgentCount: number;
  activeCount: number;
  totalOutstandings: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  onSearchFocus: () => void;
  onOpenEmailModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  urgentCount,
  activeCount,
  totalOutstandings,
  theme,
  onToggleTheme,
  onOpenMobileMenu,
  onSearchFocus,
  onOpenEmailModal,
}) => {
  const [timeString, setTimeString] = useState<string>('UTC 14:32:09');
  const [dateString, setDateString] = useState<string>('24 OCT 2026');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeString(`UTC ${hours}:${minutes}:${seconds}`);

      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const day = String(now.getUTCDate()).padStart(2, '0');
      const month = months[now.getUTCMonth()];
      const year = now.getUTCFullYear();
      setDateString(`${day} ${month} ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#102034]/90 backdrop-blur-md z-30 px-4 lg:px-6 flex items-center justify-between border-b border-[#1b2b3f]">
      {/* Left Telemetry Cluster */}
      <div className="flex items-center gap-4 lg:gap-6">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded bg-[#0b1c30] text-[#c2c6d6] hover:text-white"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Clock / Calendar */}
        <div className="flex items-center gap-3 py-1 px-3 bg-[#000f21] rounded border border-[#1b2b3f]/70 text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8c909f]" />
            <span className="tabular-nums text-[#c2c6d6] font-medium tracking-tight">
              {timeString}
            </span>
          </div>
          <span className="text-[#424754]">|</span>
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#8c909f]" />
            <span className="tabular-nums text-[#c2c6d6] font-medium tracking-tight">
              {dateString}
            </span>
          </div>
        </div>

        {/* Global Executive KPIs */}
        <div className="hidden xl:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0b1c30] border border-[#1b2b3f]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                Urgent Alerts
              </span>
            </div>
            <span className="tabular-nums text-sm font-bold text-[#ffb4ab]">
              {String(urgentCount).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0b1c30] border border-[#1b2b3f]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Active Programmes
            </span>
            <span className="tabular-nums text-sm font-bold text-[#d3e4fe]">
              {activeCount}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0b1c30] border border-[#1b2b3f]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
              Total Outstandings
            </span>
            <span className="tabular-nums text-sm font-bold text-[#adc6ff]">
              {formatUSD(totalOutstandings)}
            </span>
          </div>
        </div>
      </div>

      {/* Right User & Utility Controls */}
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchFocus}
            type="button"
            className="w-9 h-9 rounded bg-[#0b1c30] text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe] flex items-center justify-center transition-colors border border-[#1b2b3f]"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="relative w-9 h-9 rounded bg-[#0b1c30] text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe] flex items-center justify-center transition-colors border border-[#1b2b3f]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {urgentCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#4d8eff] shadow-[0_0_8px_#4d8eff]" />
            )}
          </button>

          {/* Email Notification Dispatcher Button */}
          <button
            type="button"
            onClick={onOpenEmailModal}
            className="relative w-9 h-9 rounded bg-[#0b1c30] text-[#c2c6d6] hover:bg-[#1b2b3f] hover:text-[#d3e4fe] flex items-center justify-center transition-colors border border-[#1b2b3f]"
            title="Email Payment Notification Settings & Log"
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] transition-all shadow-xs cursor-pointer group active:scale-95"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light and Dark Mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 group-hover:rotate-45" />
                <span className="hidden sm:inline text-xs font-semibold text-[#c2c6d6]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-300 group-hover:-rotate-12" />
                <span className="hidden sm:inline text-xs font-semibold text-[#334155]">Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Global Rights Lead Profile */}
        <div className="flex items-center gap-3 pl-3 bg-[#000f21] py-1 px-3 rounded border border-[#1b2b3f]">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-[#d3e4fe] font-semibold leading-tight">
              Acquisition Desk
            </span>
            <span className="text-[11px] text-[#8c909f] leading-none">
              Global Rights Lead
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#adc6ff] flex items-center justify-center text-[#002e6a] shadow-xs">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};

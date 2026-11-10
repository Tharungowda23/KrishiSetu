import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User as UserIcon,
  Bell,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  Sprout,
  Store,
  Home,
  Info,
  Phone,
  HelpCircle,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import NotificationDropdown from '../common/NotificationDropdown';

const Navbar = () => {
  const { user, isAuthenticated, logout, isFarmer, isBuyer, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) setUnread(res.data.unreadCount || 0);
      } catch {}
    };
    fetch();
    const t = setInterval(fetch, 45000);
    return () => clearInterval(t);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const portalPath = isFarmer ? '/farmer/dashboard' : isBuyer ? '/buyer/dashboard' : '/admin/dashboard';
  const portalLabel = isFarmer ? 'Farmer Portal' : isBuyer ? 'Buyer Portal' : 'Admin Portal';
  const profilePath = isFarmer ? '/farmer/profile' : isBuyer ? '/buyer/profile' : '/admin/dashboard';

  /* Public nav links — only shown to guests */
  const publicLinks = [
    { label: 'Home',               path: '/',                   icon: Home },
    { label: 'Marketplace',        path: '/marketplace',        icon: Store },
    { label: 'Transport Estimator',path: '/transport-estimator',icon: Truck },
    { label: 'How It Works',       path: '/how-it-works',       icon: HelpCircle },
    { label: 'About',              path: '/about',              icon: Info },
    { label: 'Contact',            path: '/contact',            icon: Phone },
  ];

  /* Condensed links shown to logged-in users on public pages */
  const authLinks = [
    { label: 'Marketplace', path: '/marketplace', icon: Store },
    { label: 'Transport',   path: '/transport-estimator', icon: Truck },
  ];

  const links = isAuthenticated ? authLinks : publicLinks;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand ─────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-agrigreen-100 flex items-center justify-center p-2 group-hover:bg-agrigreen-200 transition-colors">
              <img src="/logo.svg" alt="KrishiSetu" className="w-full h-full" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-forest tracking-tight block leading-tight">
                Krishi<span className="text-agrigreen-500">Setu</span>
              </span>
              <span className="text-[9px] font-medium text-slate-400 tracking-wide hidden sm:block">
                Connect. Compare. Sell Smarter.
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-forest bg-agrigreen-50 font-semibold'
                      : 'text-slate-600 hover:text-forest hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Actions ─────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Go to Portal */}
                <Link
                  to={portalPath}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-forest text-white text-sm font-semibold hover:bg-forest-light transition-colors shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{portalLabel}</span>
                </Link>

                {/* Notifications Dropdown */}
                <NotificationDropdown align="right" />

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-forest text-white flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                      {user?.profileImage
                        ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        : user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <span className="text-xs font-bold text-slate-800 block leading-tight truncate max-w-[90px]">
                        {user?.name}
                      </span>
                      <span className="text-[9px] font-semibold text-forest uppercase tracking-wide">
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      {/* Backdrop to close */}
                      <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-agrigreen-100 text-forest uppercase tracking-wide capitalize">
                            {user?.role}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to={portalPath}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-forest" />
                            My Dashboard
                          </Link>
                          <Link
                            to={profilePath}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <UserIcon className="w-4 h-4 text-forest" />
                            Profile & Settings
                          </Link>
                        </div>

                        <div className="border-t border-slate-100 py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Log In
                </Link>
                <Link
                  to="/register?role=farmer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-forest text-white text-sm font-semibold hover:bg-forest-light transition-colors shadow-sm"
                >
                  <Sprout className="w-4 h-4" />
                  Start Selling
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Button ─────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <Link to={portalPath} className="p-2 rounded-lg bg-agrigreen-100 text-forest">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-agrigreen-50 text-forest font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-forest" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="p-3 bg-slate-50 rounded-xl mb-2">
                  <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                  <span className="text-xs font-semibold text-forest uppercase tracking-wide">{user?.role}</span>
                </div>
                <Link to={portalPath} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-forest text-white text-sm font-semibold">
                  <LayoutDashboard className="w-4 h-4" />
                  Go to {portalLabel}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
                  Log In
                </Link>
                <Link to="/register?role=farmer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-forest text-white text-sm font-semibold">
                  <Sprout className="w-4 h-4" />
                  Join as Farmer
                </Link>
                <Link to="/register?role=buyer" className="block text-center py-2 text-sm font-medium text-forest hover:underline">
                  Join as Buyer
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

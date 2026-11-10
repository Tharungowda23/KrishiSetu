import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Layers,
  GitCompare,
  TrendingUp,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Store,
  Bookmark,
  ShoppingBag,
  Users,
  BarChart3,
  Truck,
  Bell,
  Sprout,
  ChevronRight,
  Settings,
  Shield,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import NotificationDropdown from '../common/NotificationDropdown';

/* ── Sidebar link groups by role ───────────────────────────────── */
const farmerLinks = [
  { group: 'Main', items: [
    { label: 'Dashboard',       path: '/farmer/dashboard',      icon: LayoutDashboard },
    { label: 'Add Crop Listing',path: '/farmer/add-crop',       icon: PlusCircle },
    { label: 'My Listings',     path: '/farmer/listings',       icon: Package },
  ]},
  { group: 'Offers & Sales', items: [
    { label: 'Buyer Offers',    path: '/farmer/offers',         icon: Layers },
    { label: 'Compare Offers',  path: '/farmer/compare-offers', icon: GitCompare, badge: 'Core' },
    { label: 'My Sales',        path: '/farmer/sales',          icon: TrendingUp },
  ]},
  { group: 'Tools', items: [
    { label: 'Messages',        path: '/farmer/messages',       icon: MessageSquare },
    { label: 'Transport Tool',  path: '/transport-estimator',   icon: Truck },
    { label: 'Profile & Farm',  path: '/farmer/profile',        icon: User },
  ]},
];

const buyerLinks = [
  { group: 'Main', items: [
    { label: 'Dashboard',       path: '/buyer/dashboard',       icon: LayoutDashboard },
    { label: 'Browse Crops',    path: '/marketplace',           icon: Store },
    { label: 'Saved Crops',     path: '/buyer/saved',           icon: Bookmark },
  ]},
  { group: 'Transactions', items: [
    { label: 'My Offers',       path: '/buyer/offers',          icon: Layers },
    { label: 'My Purchases',    path: '/buyer/purchases',       icon: ShoppingBag },
  ]},
  { group: 'Tools', items: [
    { label: 'Messages',        path: '/buyer/messages',        icon: MessageSquare },
    { label: 'Transport Tool',  path: '/transport-estimator',   icon: Truck },
    { label: 'Profile',         path: '/buyer/profile',         icon: User },
  ]},
];

const adminLinks = [
  { group: 'Administration', items: [
    { label: 'Admin Dashboard', path: '/admin/dashboard',       icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users',           icon: Users },
    { label: 'Listing Moderation', path: '/admin/listings',     icon: Package },
    { label: 'Transactions',    path: '/admin/transactions',    icon: ShoppingBag },
    { label: 'Reports',         path: '/admin/reports',         icon: BarChart3 },
  ]},
  { group: 'Platform', items: [
    { label: 'Public Marketplace', path: '/marketplace',        icon: Store },
  ]},
];

/* ── Role config ───────────────────────────────────────────────── */
const ROLE_CONFIG = {
  farmer: {
    links: farmerLinks,
    label: 'Farmer Portal',
    accentBg: 'bg-forest',
    accentText: 'text-white',
    badgeClass: 'bg-agrigreen-100 text-forest',
    icon: Sprout,
  },
  buyer: {
    links: buyerLinks,
    label: 'Buyer Portal',
    accentBg: 'bg-blue-700',
    accentText: 'text-white',
    badgeClass: 'bg-blue-100 text-blue-700',
    icon: Store,
  },
  admin: {
    links: adminLinks,
    label: 'Admin Central',
    accentBg: 'bg-purple-700',
    accentText: 'text-white',
    badgeClass: 'bg-purple-100 text-purple-700',
    icon: Shield,
  },
};

/* ── Sidebar link item ─────────────────────────────────────────── */
const SidebarLink = ({ item, isActive, onClose }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClose}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-forest text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
        }`}>
          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
        </div>
        <span>{item.label}</span>
      </div>
      {item.badge && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide ${
          isActive ? 'bg-white/20 text-white' : 'bg-agrigreen-100 text-forest'
        }`}>
          {item.badge}
        </span>
      )}
    </Link>
  );
};

/* ── Main Layout ───────────────────────────────────────────────── */
const DashboardLayout = ({ children }) => {
  const { user, logout, isFarmer, isBuyer, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const role = isFarmer ? 'farmer' : isBuyer ? 'buyer' : 'admin';
  const cfg = ROLE_CONFIG[role];
  const RoleIcon = cfg.icon;

  // Fetch unread notifications
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) setUnread(res.data.unreadCount || 0);
      } catch {}
    };
    fetch();
    const t = setInterval(fetch, 45000);
    return () => clearInterval(t);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const profilePath = isFarmer ? '/farmer/profile' : isBuyer ? '/buyer/profile' : '/admin/dashboard';

  /* current page label for breadcrumb */
  const currentLink = cfg.links.flatMap(g => g.items).find(l => l.path === location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Mobile backdrop ─────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ SIDEBAR ════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col
          shadow-xl transition-transform duration-250 ease-in-out
          md:translate-x-0 md:static md:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-agrigreen-100 flex items-center justify-center p-1.5 group-hover:bg-agrigreen-200 transition-colors">
              <img src="/logo.svg" alt="KrishiSetu" className="w-full h-full" />
            </div>
            <div>
              <span className="text-base font-extrabold text-forest tracking-tight leading-none block">
                Krishi<span className="text-agrigreen-500">Setu</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                {cfg.label}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User card */}
        <div className="mx-3 mt-4 mb-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-forest text-white font-bold text-sm flex items-center justify-center uppercase shrink-0 shadow-sm overflow-hidden">
              {user?.profileImage
                ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                : user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
          {cfg.links.map((group) => (
            <div key={group.group}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-1.5">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                    onClose={() => setSidebarOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 space-y-0.5 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Home className="w-3.5 h-3.5 text-slate-400" />
            </div>
            Public Home
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ MAIN AREA ══════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-400 hidden sm:block">{cfg.label}</span>
              {currentLink && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:block" />
                  <span className="font-bold text-slate-800">{currentLink.label}</span>
                </>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Marketplace shortcut */}
            <Link
              to="/marketplace"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-forest" />
              Marketplace
            </Link>

            {/* Notifications Dropdown */}
            <NotificationDropdown align="right" />

            {/* Avatar */}
            <Link
              to={profilePath}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              title="My Profile"
            >
              <div className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center uppercase overflow-hidden">
                {user?.profileImage
                  ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  : user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[90px]">{user?.name}</p>
                <p className="text-[9px] font-semibold text-forest uppercase tracking-wide">{role}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Clock,
  Layers,
  ShoppingBag,
  MessageSquare,
  PackageCheck,
  AlertCircle,
  X,
  ExternalLink,
  Info,
} from 'lucide-react';
import api from '../../services/api';
import { formatRelativeTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'offer_received':
    case 'offer_countered':
      return { icon: Layers, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    case 'offer_accepted':
      return { icon: PackageCheck, color: 'text-forest bg-agrigreen-50 border-agrigreen-200' };
    case 'offer_rejected':
      return { icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' };
    case 'sale_update':
      return { icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    case 'message_received':
      return { icon: MessageSquare, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    default:
      return { icon: Info, color: 'text-forest bg-agrigreen-50 border-agrigreen-200' };
  }
};

const NotificationDropdown = ({ align = 'right' }) => {
  const { user, isFarmer, isBuyer, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      setActionLoading(true);
      const res = await api.patch('/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.warn('Failed to mark all as read:', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    // Optimistically mark as read
    if (!notif.read) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.warn('Failed to mark notification as read:', err.message);
      }
    }

    setIsOpen(false);

    // Navigate to appropriate page depending on notification type & role
    if (isFarmer) {
      if (notif.type === 'offer_received' || notif.type === 'offer_countered') {
        navigate('/farmer/compare-offers');
      } else if (notif.type === 'offer_accepted' || notif.type === 'sale_update') {
        navigate('/farmer/sales');
      } else if (notif.type === 'message_received') {
        navigate('/farmer/messages');
      } else {
        navigate('/farmer/dashboard');
      }
    } else if (isBuyer) {
      if (notif.type === 'offer_received' || notif.type === 'offer_countered') {
        navigate('/buyer/offers');
      } else if (notif.type === 'offer_accepted' || notif.type === 'sale_update') {
        navigate('/buyer/purchases');
      } else if (notif.type === 'message_received') {
        navigate('/buyer/messages');
      } else {
        navigate('/buyer/dashboard');
      }
    } else if (isAdmin) {
      if (notif.type === 'sale_update') {
        navigate('/admin/transactions');
      } else {
        navigate('/admin/dashboard');
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`relative p-2 rounded-xl transition-all duration-150 flex items-center justify-center ${
          isOpen
            ? 'bg-agrigreen-100 text-forest shadow-xs'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
        title="Notifications"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-scale-in`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">Notifications</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-forest text-white text-[10px] font-bold">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-semibold">
                  All read
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={actionLoading}
                  className="flex items-center gap-1 text-[11px] font-semibold text-forest hover:text-forest-light px-2 py-1 rounded-lg hover:bg-agrigreen-50 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                type="button"
                onClick={fetchNotifications}
                disabled={loading}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-forest" />
                Checking notifications...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => {
                const { icon: Icon, color } = getNotificationIcon(n.type);
                const isUnread = !n.read;

                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left hover:bg-slate-50 ${
                      isUnread ? 'bg-agrigreen-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p
                          className={`text-xs leading-snug truncate ${
                            isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                          }`}
                        >
                          {n.title}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-forest shrink-0" title="Unread" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(n.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  When you receive buyer offers, order updates, or price alerts, they will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (isFarmer) navigate('/farmer/offers');
                  else if (isBuyer) navigate('/buyer/offers');
                  else navigate('/admin/dashboard');
                }}
                className="text-[11px] font-semibold text-forest hover:underline inline-flex items-center gap-1"
              >
                <span>View all activity</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

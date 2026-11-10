import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Info,
  ChevronRight,
  ShieldCheck,
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

const RecentNotificationsCard = ({ title = 'Recent Notifications', maxItems = 4 }) => {
  const { isFarmer, isBuyer, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
  }, []);

  const handleMarkAllAsRead = async () => {
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

  const displayedList = notifications.slice(0, maxItems);

  return (
    <div className="card p-5 sm:p-6 bg-white border border-slate-200 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-agrigreen-50 text-forest flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="text-[11px] text-slate-400">Activity and alerts requiring your attention</p>
          </div>
          {unreadCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={actionLoading}
              className="text-xs font-semibold text-forest hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          <RefreshCw className="w-4 h-4 mx-auto mb-1 animate-spin text-forest" />
          Loading notifications...
        </div>
      ) : displayedList.length > 0 ? (
        <div className="space-y-2.5">
          {displayedList.map((n) => {
            const { icon: Icon, color } = getNotificationIcon(n.type);
            const isUnread = !n.read;

            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 hover:shadow-xs ${
                  isUnread
                    ? 'bg-agrigreen-50 border-agrigreen-200 hover:bg-agrigreen-100'
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs truncate ${
                        isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                      }`}
                    >
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {isUnread && (
                  <span
                    className="w-2 h-2 rounded-full bg-forest shrink-0 mt-1.5"
                    title="Unread"
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400">
          <Bell className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
          <p className="font-semibold text-slate-600">No active notifications</p>
          <p className="text-[11px] text-slate-400 mt-0.5">You're all caught up on alerts and offers.</p>
        </div>
      )}
    </div>
  );
};

export default RecentNotificationsCard;

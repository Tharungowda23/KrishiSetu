import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (roleFilter !== 'All') query.set('role', roleFilter);
      if (search) query.set('search', search);

      const res = await api.get(`/admin/users?${query.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.warn('Error loading users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleStatusChange = async (userId, accountStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { accountStatus });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleVerify = async (userId, verificationStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { verificationStatus });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update verification.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-agritext-main">User Account Management</h1>
          <p className="text-xs text-agritext-secondary mt-0.5">
            Moderate registered farmers, commercial buyers, and identity verifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'farmer', 'buyer', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                roleFilter === role
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white border border-agriborder text-agritext-secondary hover:bg-cream'
              }`}
            >
              {role === 'All' ? 'All Roles' : `${role}s`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading users..." />
      ) : (
        <div className="card overflow-hidden bg-white border-agriborder">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream/60 border-b border-agriborder uppercase text-agritext-secondary text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agriborder/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-cream/30">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-agritext-main block">{u.name}</span>
                        <span className="text-[11px] text-agritext-secondary">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold capitalize">{u.role}</td>
                    <td className="py-3 px-4 text-agritext-secondary">
                      {u.location?.district || 'Karnataka'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={u.verificationStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={u.accountStatus} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {u.verificationStatus !== 'verified' && (
                        <button
                          onClick={() => handleVerify(u._id, 'verified')}
                          className="px-2 py-1 rounded bg-agrigreen-100 text-forest font-semibold hover:bg-forest hover:text-white"
                        >
                          Verify
                        </button>
                      )}

                      {u.accountStatus === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(u._id, 'suspended')}
                          className="px-2 py-1 rounded bg-rose-50 text-agrierror font-semibold hover:bg-agrierror hover:text-white"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(u._id, 'active')}
                          className="px-2 py-1 rounded bg-agrigreen-50 text-forest font-semibold hover:bg-forest hover:text-white"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

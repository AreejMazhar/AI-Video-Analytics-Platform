import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch, FiUser,
  FiUserCheck, FiUserX, FiShield, FiMail, FiClock,
  FiSave, FiX, FiAlertCircle
} from 'react-icons/fi';
import { userService } from '../api/services/userService';
import Modal from '../components/common/Modal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'viewer' });

  // Custom modal state
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', content: null, onConfirm: null });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'viewer' });
    setEditingUser(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = await userService.createUser(formData);
      setUsers([...users, newUser]);
      setShowAddModal(false);
      resetForm();
      setModalConfig({
        isOpen: true, type: 'success',
        title: 'User Created',
        content: `User "${newUser.name}" (${newUser.email}) has been added successfully.`
      });
    } catch {
      setModalConfig({
        isOpen: true, type: 'danger',
        title: 'Creation Failed',
        content: 'Failed to create new user account.'
      });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role || 'viewer' });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.password) updateData.password = formData.password;
      const updated = await userService.updateUser(editingUser.id, updateData);
      setUsers(users.map(u => u.id === editingUser.id ? updated : u));
      setShowEditModal(false);
      resetForm();
      setModalConfig({
        isOpen: true, type: 'success',
        title: 'User Updated',
        content: `User "${updated.name}" details updated successfully.`
      });
    } catch {
      setModalConfig({
        isOpen: true, type: 'danger',
        title: 'Update Failed',
        content: 'Failed to update user account details.'
      });
    }
  };

  const handleDeleteUser = (user) => {
    setModalConfig({
      isOpen: true, type: 'confirm',
      title: 'Delete User Account?',
      content: `Are you sure you want to delete user "${user.name}" (${user.email})? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await userService.deleteUser(user.id);
          setUsers(users.filter(u => u.id !== user.id));
        } catch {
          setModalConfig({
            isOpen: true, type: 'danger',
            title: 'Delete Failed',
            content: 'Failed to delete user.'
          });
        }
      }
    });
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const inactiveUsers = users.filter(u => !u.is_active).length;

  const roleBadgeClass = (role) => ({ admin: 'badge-danger', operator: 'badge-primary', viewer: 'badge-muted' }[role] || 'badge-muted');

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading users...</p></div>;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage platform users and their access permissions</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <FiPlus size={16} /> Add User
        </button>
      </div>

      {error && (
        <div className="error-banner mb-16">
          <FiAlertCircle size={18} /> {error}
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setError(null)}>
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Total Users', value: totalUsers, icon: FiUser, color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
          { label: 'Active', value: activeUsers, icon: FiUserCheck, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Admins', value: adminCount, icon: FiShield, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Inactive', value: inactiveUsers, icon: FiUserX, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: 42, height: 42, borderRadius: '11px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <p className="stat-label" style={{ marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card flex mb-20" style={{ padding: '12px 16px', gap: '10px' }}>
        <FiSearch size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', flex: 1, color: 'var(--text-primary)' }}
        />
        <span className="text-sm text-muted">{filteredUsers.length} users</span>
      </div>

      {/* Users Table */}
      <div className="table-container">
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>👤</div>
            <p style={{ fontWeight: 600 }}>No users found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th><FiMail size={13} style={{ marginRight: 4 }} />Email</th>
                <th>Role</th>
                <th><FiClock size={13} style={{ marginRight: 4 }} />Last Login</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '13px', flexShrink: 0
                      }}>
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '13.5px', margin: 0 }}>{user.name}</p>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>ID #{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{user.email}</td>
                  <td>
                    <span className={`badge ${roleBadgeClass(user.role)}`} style={{ textTransform: 'capitalize' }}>
                      {user.role || 'viewer'}
                    </span>
                  </td>
                  <td className="text-sm text-muted">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-dot ${user.is_active ? 'status-online' : 'status-offline'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEditUser(user)}>
                        <FiEdit size={13} />
                      </button>
                      <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDeleteUser(user)}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {(showAddModal || showEditModal) && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,23,42,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '24px', overflowY: 'auto'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px',
            padding: '28px 32px', width: '100%', maxWidth: '460px',
            margin: 'auto',
            animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            <div className="flex-between mb-20">
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {showAddModal ? 'Add New User' : 'Edit User'}
              </h2>
              <button className="navbar-icon-btn" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>
                <FiX size={17} />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddUser : handleUpdateUser}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Full Name *</label>
                <input className="form-input" type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Jane Smith" required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="jane@invexal.com" required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">{showAddModal ? 'Password *' : 'New Password (leave blank to keep)'}</label>
                <input className="form-input" type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder="••••••••" required={showAddModal} />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Role *</label>
                <select className="form-input form-select" name="role" value={formData.role} onChange={handleFormChange}>
                  <option value="viewer">Viewer</option>
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex" style={{ gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {showAddModal ? <><FiPlus size={15} /> Add User</> : <><FiSave size={15} /> Update User</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Custom Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        onConfirm={modalConfig.onConfirm}
      >
        {modalConfig.content}
      </Modal>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default UserManagement;
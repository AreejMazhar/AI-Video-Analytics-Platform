import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit, FiTrash2, FiSearch, FiUser,
  FiUserCheck, FiUserX, FiShield, FiMail, FiClock, FiSave
} from 'react-icons/fi';
import { userService } from '../api/services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      console.log('✅ Users loaded:', data.length);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError('Failed to load users. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: '#1a3a5c',
      operator: '#4a90d9',
      viewer: '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  const getStatusColor = (status) => {
    return status ? '#22c55e' : '#ef4444';
  };

  const getStatusLabel = (status) => {
    return status ? 'Active' : 'Inactive';
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'viewer'
    });
    setEditingUser(null);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = await userService.createUser(formData);
      setUsers([...users, newUser]);
      setShowAddModal(false);
      resetForm();
      alert('✅ User created successfully!');
    } catch (err) {
      alert('❌ Failed to create user. Please try again.');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role || 'viewer'
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      const updated = await userService.updateUser(editingUser.id, updateData);
      setUsers(users.map(u => u.id === editingUser.id ? updated : u));
      setShowEditModal(false);
      resetForm();
      alert('✅ User updated successfully!');
    } catch (err) {
      alert('❌ Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert('✅ User deleted successfully!');
    } catch (err) {
      alert('❌ Failed to delete user. Please try again.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const inactiveUsers = users.filter(u => !u.is_active).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e0e4e8',
            borderTop: '4px solid #1a3a5c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p>{error}</p>
          <button
            onClick={fetchUsers}
            style={{
              marginTop: '12px',
              padding: '8px 20px',
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px' }}>
            User Management
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Manage users and their permissions
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: '#1a3a5c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <FiPlus size={18} />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '14px 18px',
          border: '1px solid #e8edf2',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FiUser size={24} color="#4a90d9" />
          <div>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Total Users</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a5c', margin: 0 }}>{totalUsers}</p>
          </div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '14px 18px',
          border: '1px solid #e8edf2',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FiUserCheck size={24} color="#22c55e" />
          <div>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Active</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', margin: 0 }}>{activeUsers}</p>
          </div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '14px 18px',
          border: '1px solid #e8edf2',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FiShield size={24} color="#1a3a5c" />
          <div>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Admins</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a5c', margin: 0 }}>{adminCount}</p>
          </div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '14px 18px',
          border: '1px solid #e8edf2',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FiUserX size={24} color="#ef4444" />
          <div>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Inactive</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444', margin: 0 }}>{inactiveUsers}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'white',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid #e8edf2',
        marginBottom: '20px'
      }}>
        <FiSearch color="#6b7280" size={20} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            flex: 1,
            fontSize: '14px',
            color: '#1a1a2e'
          }}
        />
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e8edf2',
        overflow: 'hidden'
      }}>
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>No users found</p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  User
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  <FiMail size={14} style={{ marginRight: '4px' }} />
                  Email
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Role
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  <FiClock size={14} style={{ marginRight: '4px' }} />
                  Last Login
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} style={{
                  borderTop: index === 0 ? 'none' : '1px solid #f0f2f5',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1a3a5c',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#4a4a6a' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: getRoleBadgeColor(user.role) + '15',
                      color: getRoleBadgeColor(user.role),
                      fontWeight: '500',
                      fontSize: '12px'
                    }}>
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Viewer'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'center',
                      fontSize: '13px',
                      color: getStatusColor(user.is_active),
                      fontWeight: '500'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: getStatusColor(user.is_active),
                        display: 'inline-block'
                      }} />
                      {getStatusLabel(user.is_active)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button
                        onClick={() => handleEditUser(user)}
                        style={{
                          padding: '4px 10px',
                          background: '#f5f7fa',
                          border: '1px solid #e8edf2',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#4a4a6a'
                        }}
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={{
                          padding: '4px 10px',
                          background: '#f5f7fa',
                          border: '1px solid #e8edf2',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#ef4444'
                        }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a3a5c', marginBottom: '20px' }}>
              Add New User
            </h2>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="john.doe@invexal.com"
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="viewer">Viewer</option>
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  style={{
                    padding: '10px 24px',
                    background: '#f5f7fa',
                    border: '1px solid #e8edf2',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#4a4a6a'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    background: '#1a3a5c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FiPlus size={16} />
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a3a5c', marginBottom: '20px' }}>
              Edit User
            </h2>
            <form onSubmit={handleUpdateUser}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="viewer">Viewer</option>
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  style={{
                    padding: '10px 24px',
                    background: '#f5f7fa',
                    border: '1px solid #e8edf2',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#4a4a6a'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    background: '#1a3a5c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FiSave size={16} />
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
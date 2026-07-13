import React, { useState } from 'react';
import { 
  FiPlus, FiEdit, FiTrash2, FiSearch, FiUser,
  FiUserCheck, FiUserX, FiShield, FiMail, FiClock
} from 'react-icons/fi';

const UserManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock users data - will come from backend
  const [users] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john.doe@invexal.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '2024-07-13 14:32:15',
      created: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane.smith@invexal.com',
      role: 'Operator',
      status: 'active',
      lastLogin: '2024-07-13 12:20:08',
      created: '2024-02-20'
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike.johnson@invexal.com',
      role: 'Viewer',
      status: 'active',
      lastLogin: '2024-07-12 16:45:22',
      created: '2024-03-10'
    },
    { 
      id: 4, 
      name: 'Sarah Wilson', 
      email: 'sarah.wilson@invexal.com',
      role: 'Operator',
      status: 'inactive',
      lastLogin: '2024-07-05 09:12:34',
      created: '2024-04-05'
    },
    { 
      id: 5, 
      name: 'David Brown', 
      email: 'david.brown@invexal.com',
      role: 'Viewer',
      status: 'active',
      lastLogin: '2024-07-13 10:05:43',
      created: '2024-05-12'
    },
  ]);

  const getRoleBadgeColor = (role) => {
    const colors = {
      Admin: '#1a3a5c',
      Operator: '#4a90d9',
      Viewer: '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#22c55e' : '#ef4444';
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onClick={() => setShowAddModal(true)}
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
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a5c', margin: 0 }}>{users.length}</p>
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
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', margin: 0 }}>
              {users.filter(u => u.status === 'active').length}
            </p>
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
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a5c', margin: 0 }}>
              {users.filter(u => u.role === 'Admin').length}
            </p>
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
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444', margin: 0 }}>
              {users.filter(u => u.status === 'inactive').length}
            </p>
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
                      {user.name.charAt(0)}
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
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                  {user.lastLogin}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center',
                    fontSize: '13px',
                    color: getStatusColor(user.status),
                    fontWeight: '500'
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: getStatusColor(user.status),
                      display: 'inline-block'
                    }} />
                    {getStatusLabel(user.status)}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    <button style={{
                      padding: '4px 10px',
                      background: '#f5f7fa',
                      border: '1px solid #e8edf2',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#4a4a6a'
                    }}>
                      <FiEdit size={14} />
                    </button>
                    <button style={{
                      padding: '4px 10px',
                      background: '#f5f7fa',
                      border: '1px solid #e8edf2',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#ef4444'
                    }}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <form>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="John Doe"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="john.doe@invexal.com"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Password *
                </label>
                <input
                  type="password"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="••••••••"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Role *
                </label>
                <select
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
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Status
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                    fontWeight: '500'
                  }}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
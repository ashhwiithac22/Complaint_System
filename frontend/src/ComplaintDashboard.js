import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ComplaintDashboard({ user, onLogout, onNavigate, canRaise }) {
    const [complaints, setComplaints] = useState([]);
    const [escalatedComplaints, setEscalatedComplaints] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({ pending: 0, in_progress: 0, resolved: 0, escalated: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyToUser, setReplyToUser] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchComplaints();
        fetchEscalatedComplaints();
        fetchStats();
        fetchNotifications();
        const interval = setInterval(() => {
            fetchComplaints();
            fetchEscalatedComplaints();
            fetchStats();
            fetchNotifications();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/complaints', {
                params: {
                    user_id: user.id,
                    role: user.role,
                    warehouse_id: user.warehouse_id || '',
                    unit: user.unit || ''
                }
            });
            setComplaints(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setLoading(false);
        }
    };

    const fetchEscalatedComplaints = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/complaints/escalated');
            setEscalatedComplaints(response.data);
        } catch (error) {
            console.error('Error fetching escalated complaints:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
                params: {
                    user_id: user.id,
                    role: user.role,
                    warehouse_id: user.warehouse_id || '',
                    unit: user.unit || ''
                }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/notifications/${user.id}`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markNotificationRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification read:', error);
        }
    };

    const updateStatus = async (complaintId, newStatus, resolutionNotes = '') => {
        try {
            await axios.put(`http://localhost:5000/api/complaints/${complaintId}/status`, {
                status: newStatus,
                resolved_by: user.id,
                resolution_notes: resolutionNotes
            });
            fetchComplaints();
            fetchEscalatedComplaints();
            fetchStats();
            setShowModal(false);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const markAsInProgress = async (complaintId) => {
        try {
            await axios.put(`http://localhost:5000/api/complaints/${complaintId}/in-progress`, {
                started_by: user.id
            });
            fetchComplaints();
            fetchStats();
            setShowModal(false);
        } catch (error) {
            console.error('Error marking as in progress:', error);
            alert(error.response?.data?.message || 'Error marking as in progress');
        }
    };

    const escalateComplaint = async (complaintId, reason = 'Manually escalated') => {
        try {
            await axios.put(`http://localhost:5000/api/complaints/${complaintId}/escalate`, { reason });
            fetchComplaints();
            fetchEscalatedComplaints();
            fetchStats();
            setShowModal(false);
        } catch (error) {
            console.error('Error escalating complaint:', error);
        }
    };

    const sendMessage = async (complaintId, toUserId, message) => {
        try {
            await axios.post('http://localhost:5000/api/send-message', {
                complaint_id: complaintId,
                from_user_id: user.id,
                to_user_id: toUserId,
                message: message
            });
            alert('Message sent successfully!');
            setShowReplyModal(false);
            setReplyMessage('');
            fetchNotifications();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return '#ef4444';
            case 'In Progress': return '#f59e0b';
            case 'Resolved': return '#22c55e';
            case 'Escalated': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const getStatusBgColor = (status) => {
        switch(status) {
            case 'Pending': return '#fee2e2';
            case 'In Progress': return '#fed7aa';
            case 'Resolved': return '#dcfce7';
            case 'Escalated': return '#ede9fe';
            default: return '#f3f4f6';
        }
    };

    const getRoleTitle = () => {
        switch(user.role) {
            case 'sales': return 'My Complaints';
            case 'warehouse_team': return 'Assigned Complaints';
            case 'warehouse_manager': return 'Warehouse Complaints';
            case 'unit_head': return 'Unit Complaints';
            default: return 'All Complaints';
        }
    };

    const getActionButtons = (complaint) => {
        if (user.role === 'warehouse_team' || user.role === 'warehouse_manager') {
            return (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => { setSelectedComplaint(complaint); setShowModal(true); }} style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px' }}>View</button>
                    <button onClick={() => { setSelectedComplaint(complaint); setReplyToUser(complaint.sales_exec_id); setShowReplyModal(true); }} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px' }}>Message</button>
                    
                    {complaint.status === 'Pending' && (
                        <button onClick={() => markAsInProgress(complaint.id)} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px' }}>Start Progress</button>
                    )}
                    
                    {complaint.status === 'In Progress' && (
                        <button onClick={() => updateStatus(complaint.id, 'Resolved', 'Issue resolved')} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px' }}>Mark Resolved</button>
                    )}
                    
                    {complaint.status !== 'Escalated' && complaint.status !== 'Resolved' && complaint.status !== 'In Progress' && (
                        <button onClick={() => escalateComplaint(complaint.id, 'Manually escalated by manager')} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px' }}>Escalate</button>
                    )}
                </div>
            );
        }
        return (
            <button onClick={() => { setSelectedComplaint(complaint); setShowModal(true); }} style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px' }}>View</button>
        );
    };

    const displayComplaints = activeTab === 'all' ? complaints : escalatedComplaints;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 24px', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ color: 'white', margin: '0', fontSize: '28px', fontWeight: '700' }}>Complaint Dashboard</h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0' }}>{getRoleTitle()} | Role: {user.role}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px', position: 'relative' }}>🔔
                                {notifications.length > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications.length}</span>}
                            </button>
                            {showNotifications && (
                                <div style={{ position: 'absolute', top: '50px', right: '0', width: '300px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '400px', overflow: 'auto' }}>
                                    <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Notifications</div>
                                    {notifications.length === 0 ? <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No new notifications</div> : notifications.map(notif => (
                                        <div key={notif.id} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => markNotificationRead(notif.id)}>
                                            <p style={{ margin: '0', fontSize: '13px' }}>{notif.message}</p>
                                            <small style={{ color: '#6b7280' }}>Complaint: {notif.complaint_code}</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {canRaise && <button onClick={() => onNavigate('raise')} style={{ padding: '10px 24px', background: 'white', color: '#667eea', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>+ Raise New Complaint</button>}
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Logged in as</span>
                            <p style={{ color: 'white', margin: '4px 0 0 0', fontWeight: '600' }}>{user?.employee_name}</p>
                        </div>
                        <button onClick={onLogout} style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Logout</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center' }}><p style={{ color: '#ef4444', fontSize: '28px', fontWeight: '700', margin: '0' }}>{stats.pending}</p><p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>Pending</p></div>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center' }}><p style={{ color: '#f59e0b', fontSize: '28px', fontWeight: '700', margin: '0' }}>{stats.in_progress}</p><p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>In Progress</p></div>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center' }}><p style={{ color: '#22c55e', fontSize: '28px', fontWeight: '700', margin: '0' }}>{stats.resolved}</p><p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>Resolved</p></div>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center' }}><p style={{ color: '#8b5cf6', fontSize: '28px', fontWeight: '700', margin: '0' }}>{stats.escalated}</p><p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>Escalated</p></div>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center' }}><p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: '0' }}>{stats.total}</p><p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>Total</p></div>
                </div>

                {(user.role === 'warehouse_manager' || user.role === 'warehouse_team') && (
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                        <button onClick={() => setActiveTab('all')} style={{ padding: '10px 24px', background: activeTab === 'all' ? 'white' : 'rgba(255,255,255,0.2)', color: activeTab === 'all' ? '#667eea' : 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>All Complaints</button>
                        <button onClick={() => setActiveTab('escalated')} style={{ padding: '10px 24px', background: activeTab === 'escalated' ? 'white' : 'rgba(255,255,255,0.2)', color: activeTab === 'escalated' ? '#f59e0b' : 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>⚠️ Escalated Complaints ({escalatedComplaints.length})</button>
                    </div>
                )}

                <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>{activeTab === 'all' ? getRoleTitle() : '⚠️ Escalated Complaints (Pending > 24 hours)'}</h3>
                    </div>
                    {loading ? <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div> : displayComplaints.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No complaints found</div> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>ID</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Customer</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Type</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Warehouse</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Status</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Created</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayComplaints.map((complaint) => (
                                        <tr key={complaint.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{complaint.complaint_id}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '14px', color: '#475569' }}>{complaint.customer_name}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '14px', color: '#475569' }}>{complaint.complaint_type}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '14px', color: '#475569' }}>{complaint.warehouse_name || '-'}</td>
                                            <td style={{ padding: '12px 16px' }}><span style={{ background: getStatusBgColor(complaint.status), color: getStatusColor(complaint.status), padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{complaint.status}</span></td>
                                            <td style={{ padding: '12px 16px', fontSize: '14px', color: '#475569' }}>{new Date(complaint.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px 16px' }}>{getActionButtons(complaint)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Complaint Details Modal */}
            {showModal && selectedComplaint && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '500px', maxWidth: '90%', padding: '24px', maxHeight: '80vh', overflow: 'auto' }}>
                        <h3 style={{ margin: '0 0 20px 0' }}>Complaint Details</h3>
                        <div style={{ marginBottom: '16px' }}><label style={{ fontWeight: '600', color: '#475569' }}>Complaint ID:</label><p>{selectedComplaint.complaint_id}</p></div>
                        <div style={{ marginBottom: '16px' }}><label style={{ fontWeight: '600', color: '#475569' }}>Customer:</label><p>{selectedComplaint.customer_name}</p></div>
                        <div style={{ marginBottom: '16px' }}><label style={{ fontWeight: '600', color: '#475569' }}>Type:</label><p>{selectedComplaint.complaint_type}</p></div>
                        {selectedComplaint.complaint_subtype && <div style={{ marginBottom: '16px' }}><label style={{ fontWeight: '600', color: '#475569' }}>Subtype:</label><p>{selectedComplaint.complaint_subtype}</p></div>}
                        <div style={{ marginBottom: '16px' }}><label style={{ fontWeight: '600', color: '#475569' }}>Description:</label><p>{selectedComplaint.complaint_text}</p></div>
                        {selectedComplaint.image_path && (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '600', color: '#475569' }}>Attached Image:</label>
                                <div style={{ marginTop: '8px' }}>
                                    <img src={`http://localhost:5000${selectedComplaint.image_path}`} alt="Complaint" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                                </div>
                            </div>
                        )}
                        <div style={{ marginBottom: '16px' }}><label style={{ fontWeight: '600', color: '#475569' }}>Status:</label><span style={{ background: getStatusBgColor(selectedComplaint.status), color: getStatusColor(selectedComplaint.status), padding: '4px 12px', borderRadius: '20px', fontSize: '12px', display: 'inline-block' }}>{selectedComplaint.status}</span></div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            {user.role !== 'sales' && (
                                <>
                                    {selectedComplaint.status === 'Pending' && (
                                        <button onClick={() => markAsInProgress(selectedComplaint.id)} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', flex: 1 }}>Start Progress</button>
                                    )}
                                    {selectedComplaint.status === 'In Progress' && (
                                        <button onClick={() => updateStatus(selectedComplaint.id, 'Resolved', 'Issue resolved by team')} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', flex: 1 }}>Mark Resolved</button>
                                    )}
                                    {selectedComplaint.status !== 'Resolved' && selectedComplaint.status !== 'Escalated' && selectedComplaint.status !== 'In Progress' && (
                                        <button onClick={() => escalateComplaint(selectedComplaint.id, 'Manually escalated by manager')} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', flex: 1 }}>Escalate</button>
                                    )}
                                </>
                            )}
                            <button onClick={() => setShowModal(false)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', flex: 1 }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Message Modal */}
            {showReplyModal && selectedComplaint && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '450px', maxWidth: '90%', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0' }}>Send Message to Sales Executive</h3>
                        <p style={{ color: '#6b7280', marginBottom: '16px' }}>Complaint: {selectedComplaint.complaint_id}</p>
                        <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Type your message here..." rows={5} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', resize: 'vertical', marginBottom: '20px', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => sendMessage(selectedComplaint.id, replyToUser, replyMessage)} disabled={!replyMessage.trim()} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: replyMessage.trim() ? 'pointer' : 'not-allowed', flex: 1, opacity: replyMessage.trim() ? 1 : 0.5 }}>Send Message</button>
                            <button onClick={() => { setShowReplyModal(false); setReplyMessage(''); }} style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ComplaintDashboard;
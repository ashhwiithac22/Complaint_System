import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RaiseComplaint({ user, onLogout }) {
    const [customerId, setCustomerId] = useState('');
    const [invoiceId, setInvoiceId] = useState('');
    const [complaintType, setComplaintType] = useState('');
    const [complaintSubtype, setComplaintSubtype] = useState('');
    const [description, setDescription] = useState('');
    const [warehouse, setWarehouse] = useState('');
    const [message, setMessage] = useState('');
    const [customers, setCustomers] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSubtype, setShowSubtype] = useState(false);

    const subtypeOptions = {
        'Mismatch': ['Wrong Product', 'Wrong Size'],
        'Transport': ['Delay', 'Wrong Delivery'],
        'Quality Issues': ['Shade', 'Marking', 'Stitching'],
        'Packaging': ['Without Box', 'Without Bolts']
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchInvoices = async (custId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/invoices/${custId}`);
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    const fetchWarehouse = async (custId) => {
        const response = await axios.get(`http://localhost:5000/api/warehouse/${custId}`);
        if (response.data) setWarehouse(response.data.warehouse_name);
    };

    const handleCustomerChange = (e) => {
        const custId = e.target.value;
        setCustomerId(custId);
        setInvoiceId('');
        setWarehouse('');
        setInvoices([]);
        if (custId) {
            fetchInvoices(custId);
            fetchWarehouse(custId);
        }
    };

    const handleComplaintTypeChange = (e) => {
        const type = e.target.value;
        setComplaintType(type);
        setComplaintSubtype('');
        setShowSubtype(!!subtypeOptions[type]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!customerId || !invoiceId || !complaintType || !description) {
            setMessage('Please fill all required fields');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/complaints', {
                customer_id: customerId,
                invoice_id: invoiceId,
                complaint_type: complaintType,
                complaint_subtype: complaintSubtype,
                description,
                employee_code: user?.employee_code
            });

            if (response.data.success) {
                setMessage('✓ Complaint raised successfully! ID: ' + response.data.complaint_id);
                setCustomerId('');
                setInvoiceId('');
                setComplaintType('');
                setComplaintSubtype('');
                setDescription('');
                setWarehouse('');
                setInvoices([]);
                setShowSubtype(false);
            }
        } catch (error) {
            setMessage('✗ Error raising complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 24px',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            position: 'relative',
            overflow: 'auto'
        }}>
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                background: 'rgba(255, 255, 255, 0.97)',
                borderRadius: '32px',
                padding: '40px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}>
                            <span style={{ fontSize: '24px' }}>📝</span>
                        </div>
                        <h2 style={{ color: '#1a1a2e', margin: '0', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>Raise New Complaint</h2>
                        <p style={{ color: '#6b7280', margin: '8px 0 0 0', fontSize: '14px' }}>Fill in the details below to register a complaint</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ color: '#6b7280', fontSize: '13px' }}>Logged in as</span>
                            <p style={{ color: '#1a1a2e', margin: '4px 0 0 0', fontWeight: '600' }}>{user?.employee_name}</p>
                        </div>
                        <button onClick={onLogout} style={{
                            padding: '10px 24px',
                            background: '#ffffff',
                            color: '#667eea',
                            border: '2px solid #667eea',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => { e.target.style.background = '#667eea'; e.target.style.color = '#ffffff'; }}
                        onMouseLeave={(e) => { e.target.style.background = '#ffffff'; e.target.style.color = '#667eea'; }}
                        >Logout</button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Code</label>
                            <select
                                value={customerId}
                                onChange={handleCustomerChange}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '16px',
                                    background: '#ffffff',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                required
                            >
                                <option value="">Select Customer Code</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.customer_code} - {c.customer_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invoice Number</label>
                            <select
                                value={invoiceId}
                                onChange={(e) => setInvoiceId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '16px',
                                    background: '#ffffff',
                                    fontSize: '14px',
                                    cursor: customerId ? 'pointer' : 'not-allowed',
                                    opacity: customerId ? 1 : 0.6,
                                    outline: 'none'
                                }}
                                disabled={!customerId}
                                required
                            >
                                <option value="">Select Invoice</option>
                                {invoices.map(i => (
                                    <option key={i.id} value={i.id}>{i.invoice_number} - {i.invoice_date}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {warehouse && (
                        <div style={{
                            marginBottom: '24px',
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                            borderRadius: '16px',
                            borderLeft: '4px solid #22c55e'
                        }}>
                            <span style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Warehouse</span>
                            <p style={{ color: '#1f2937', margin: '8px 0 0 0', fontSize: '16px', fontWeight: '600' }}>🏭 {warehouse}</p>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Complaint Type</label>
                            <select
                                value={complaintType}
                                onChange={handleComplaintTypeChange}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '16px',
                                    background: '#ffffff',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                                required
                            >
                                <option value="">Select Complaint Type</option>
                                <option value="Shortage">Shortage</option>
                                <option value="Excess">Excess</option>
                                <option value="Mismatch">Mismatch</option>
                                <option value="Transport">Transport Related</option>
                                <option value="Quality Issues">Quality Issues</option>
                                <option value="Packaging">Packaging</option>
                                <option value="Design Change">Design Change</option>
                                <option value="Length Issues">Length Issues</option>
                            </select>
                        </div>

                        {showSubtype && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subtype</label>
                                <select
                                    value={complaintSubtype}
                                    onChange={(e) => setComplaintSubtype(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '16px',
                                        background: '#ffffff',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                    required
                                >
                                    <option value="">Select Subtype</option>
                                    {subtypeOptions[complaintType]?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter detailed description of the issue..."
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '16px',
                                background: '#ffffff',
                                minHeight: '120px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </button>

                    {message && (
                        <p style={{ 
                            marginTop: '20px', 
                            textAlign: 'center', 
                            color: message.includes('✓') ? '#22c55e' : '#ef4444',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}

export default RaiseComplaint;
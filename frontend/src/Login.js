//Login.js

import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
    const [employee_code, setEmployeeCode] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                employee_code,
                password
            });

            if (response.data.success) {
                onLogin(response.data.user);
            }
        } catch (error) {
            setMessage('Invalid employee code or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decorative circles */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: '300px',
                height: '300px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(60px)'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '5%',
                width: '400px',
                height: '400px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }}></div>
            
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '32px',
                padding: '48px 44px',
                width: '460px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.3)',
                zIndex: 1
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px auto',
                        boxShadow: '0 10px 20px -5px rgba(102,126,234,0.4)'
                    }}>
                        <span style={{ fontSize: '32px' }}>🏭</span>
                    </div>
                    <h2 style={{ color: '#1a1a2e', margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>Welcome Back</h2>
                    <p style={{ color: '#6b7280', margin: '0', fontSize: '14px' }}>Sign in to your account</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee Code</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>👤</span>
                            <input 
                                type="text" 
                                placeholder="Enter your employee code" 
                                value={employee_code}
                                onChange={(e) => setEmployeeCode(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '16px',
                                    background: '#ffffff',
                                    color: '#1f2937',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔒</span>
                            <input 
                                type="password" 
                                placeholder="Enter your password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '16px',
                                    background: '#ffffff',
                                    color: '#1f2937',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.3s ease',
                            marginBottom: '16px'
                        }}
                    >
                        {loading ? 'Please wait...' : 'Sign in'}
                    </button>

                    {message && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>{message}</p>}
                </form>
            </div>
        </div>
    );
}

export default Login;
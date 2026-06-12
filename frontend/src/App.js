import React, { useState } from 'react';
import axios from 'axios';

function App() {
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
                setMessage('✅ Login successful!');
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            }
        } catch (error) {
            setMessage('❌ Invalid employee code or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '10px',
                width: '350px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>Ramraj Cotton</h2>
                <h3 style={{ fontSize: '14px', color: '#666', margin: '0 0 30px 0' }}>
                    Complaint Management System
                </h3>
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Employee Code" 
                        value={employee_code}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            margin: '10px 0',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            boxSizing: 'border-box',
                            fontSize: '14px'
                        }}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            margin: '10px 0',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            boxSizing: 'border-box',
                            fontSize: '14px'
                        }}
                        required
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            marginTop: '10px',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Please wait...' : 'Login'}
                    </button>
                    {message && <p style={{ marginTop: '15px', color: '#333' }}>{message}</p>}
                </form>
            </div>
        </div>
    );
}

export default App;
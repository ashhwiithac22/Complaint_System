import React, { useState, useEffect } from 'react';
import Login from './Login';
import RaiseComplaint from './RaiseComplaint';
import ComplaintDashboard from './ComplaintDashboard';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        setCurrentView('dashboard');
    };

    const handleNavigate = (view) => {
        setCurrentView(view);
    };

    if (isLoggedIn) {
        const canRaiseComplaint = user?.role === 'sales';
        
        if (currentView === 'raise' && canRaiseComplaint) {
            return <RaiseComplaint user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
        }
        
        return <ComplaintDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} canRaise={canRaiseComplaint} />;
    }

    return <Login onLogin={handleLogin} />;
}

export default App;
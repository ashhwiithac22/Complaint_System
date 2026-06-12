import React, { useState, useEffect } from 'react';
import Login from './Login';
import RaiseComplaint from './RaiseComplaint';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

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
    };

    if (isLoggedIn) {
        return <RaiseComplaint user={user} onLogout={handleLogout} />;
    }

    return <Login onLogin={handleLogin} />;
}

export default App;
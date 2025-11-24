import React from 'react';
import '../assets/styles/Setting.css';
import { FiUser, FiMail, FiSun, FiMoon, FiSave, FiLogOut } from 'react-icons/fi';

const Setting = () => {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');

    const handleSave = () => {
        console.log('Name:', name);
        console.log('Email:', email);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
    <div className="settings-container">
      <div className="settings-card">
        <h2 className="settings-title">⚙️ Account Settings</h2>
        <div className="settings-form">
          <div className="form-group">
            <label htmlFor="name"><FiUser /> Name</label>
            <input type="text" id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            
          </div>

          <div className="form-group">
            <label htmlFor="email"><FiMail /> Email</label>
            <input type="email" disabled id="email" placeholder="john@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="button-group">
            <button className="btn save" onClick={handleSave}><FiSave /> Save Changes</button>
            <button className="btn logout" onClick={handleLogout}><FiLogOut /> Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;

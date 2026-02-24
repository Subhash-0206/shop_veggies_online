import React, { useState, useEffect } from 'react';
import { User, MapPin, Key, Save, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { getCurrentUser, updateProfile, updatePassword, addAddress, removeAddress, setDefaultAddress } from '../api/api';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form states
    const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zipCode: '', defaultAddress: false });
    const [showAddressForm, setShowAddressForm] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await getCurrentUser();
            setUserData(res.data);
            setProfileForm({ name: res.data.name, phone: res.data.phone || '' });
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch profile', err);
            showMsg('error', 'Failed to initial load profile data');
        }
    };

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(profileForm);
            showMsg('success', 'Profile updated successfully!');
            fetchProfile();
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showMsg('error', 'New passwords do not match');
            return;
        }
        try {
            await updatePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            });
            showMsg('success', 'Password updated successfully!');
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to update password');
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await addAddress(addressForm);
            showMsg('success', 'Address added successfully!');
            setAddressForm({ street: '', city: '', state: '', zipCode: '', defaultAddress: false });
            setShowAddressForm(false);
            fetchProfile();
        } catch (err) {
            showMsg('error', 'Failed to add address');
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await removeAddress(id);
            showMsg('success', 'Address removed');
            fetchProfile();
        } catch (err) {
            showMsg('error', 'Failed to delete address');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await setDefaultAddress(id);
            showMsg('success', 'Default address updated');
            fetchProfile();
        } catch (err) {
            showMsg('error', 'Failed to set default address');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex flex-col space-y-2">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'info' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                    >
                        <User size={20} />
                        <span className="font-medium">Personal Info</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('addresses')}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'addresses' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                    >
                        <MapPin size={20} />
                        <span className="font-medium">Addresses</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                    >
                        <Key size={20} />
                        <span className="font-medium">Security</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-grow bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    {activeTab === 'info' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                                <User className="text-primary-600" size={24} />
                                <span>Personal Information</span>
                            </h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Email (Cannot be changed)</label>
                                    <input type="text" value={userData.email} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <button type="submit" className="btn-primary flex items-center space-x-2 mt-4">
                                    <Save size={18} />
                                    <span>Save Changes</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center space-x-2">
                                    <MapPin className="text-primary-600" size={24} />
                                    <span>My Addresses</span>
                                </h2>
                                {!showAddressForm && (
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="text-primary-600 flex items-center space-x-1 hover:text-primary-700 font-medium"
                                    >
                                        <Plus size={18} />
                                        <span>Add New</span>
                                    </button>
                                )}
                            </div>

                            {showAddressForm ? (
                                <form onSubmit={handleAddAddress} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <input
                                            placeholder="Street Address"
                                            required
                                            value={addressForm.street}
                                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <div className="grid grid-cols-3 gap-4">
                                            <input
                                                placeholder="City"
                                                required
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                            <input
                                                placeholder="State"
                                                required
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                            <input
                                                placeholder="ZIP"
                                                required
                                                value={addressForm.zipCode}
                                                onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                                className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={addressForm.defaultAddress}
                                                onChange={(e) => setAddressForm({ ...addressForm, defaultAddress: e.target.checked })}
                                                className="rounded text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-gray-600">Set as default address</span>
                                        </label>
                                    </div>
                                    <div className="flex space-x-3 pt-2">
                                        <button type="submit" className="btn-primary py-2 px-6">Save Address</button>
                                        <button type="button" onClick={() => setShowAddressForm(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                                    </div>
                                </form>
                            ) : null}

                            <div className="space-y-4">
                                {userData.addresses && userData.addresses.length > 0 ? (
                                    userData.addresses.map((addr) => (
                                        <div key={addr.id} className={`p-4 rounded-xl border flex justify-between items-start transition-all ${addr.defaultAddress ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}`}>
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <p className="font-bold text-gray-800">{addr.street}</p>
                                                    {addr.defaultAddress && (
                                                        <span className="bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {!addr.defaultAddress && (
                                                    <button
                                                        onClick={() => handleSetDefault(addr.id)}
                                                        className="text-xs text-primary-600 hover:text-primary-700 font-bold uppercase tracking-tighter"
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No addresses added yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                                <Key className="text-primary-600" size={24} />
                                <span>Security Settings</span>
                            </h2>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.oldPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary flex items-center space-x-2 mt-4">
                                    <Key size={18} />
                                    <span>Update Password</span>
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

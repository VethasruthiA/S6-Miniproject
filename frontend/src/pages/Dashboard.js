import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('========== DASHBOARD MOUNTED ==========');
    console.log('Token:', localStorage.getItem('token') ? 'Present ✅' : 'Missing ❌');
    console.log('User:', localStorage.getItem('user'));
    console.log('=======================================');
    
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError('');
      setDebug('Fetching bills...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found!');
        setError('Please login again');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      console.log('📡 Fetching bills from API...');
      console.log('Token:', token.substring(0, 20) + '...');
      
      // Set the token in axios headers
      axios.defaults.headers.common['x-auth-token'] = token;
      
      const res = await axios.get('/api/bills');
      
      console.log('📥 API Response:', res);
      console.log('📥 Response Data:', res.data);
      console.log('📥 Bills array:', res.data.bills);
      console.log('📥 Number of bills:', res.data.bills?.length || 0);

      if (res.data.success) {
        setBills(res.data.bills || []);
        setDebug(`✅ Successfully loaded ${res.data.bills?.length || 0} bills`);
        
        if (res.data.bills?.length === 0) {
          console.log('⚠️ No bills found in database');
          setError('No bills found. Create your first bill!');
        } else {
          console.log('🎉 Bills loaded successfully!');
          console.log('First bill:', res.data.bills[0]);
        }
      } else {
        console.error('❌ API returned success: false');
        setError(res.data.message || 'Failed to fetch bills');
        setDebug('❌ API error: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌❌❌ ERROR FETCHING BILLS ❌❌❌');
      console.error('Error:', err);
      console.error('Response:', err.response);
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      console.error('Message:', err.message);
      
      setDebug(`❌ Error: ${err.message}`);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Error loading dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteBill = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        const res = await axios.delete(`/api/bills/${id}`);
        if (res.data.success) {
          alert('✅ Bill deleted successfully');
          fetchBills();
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('❌ Error deleting bill');
      }
    }
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0.00';
    return Number(value).toFixed(2);
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading your dashboard...</p>
            {debug && <p style={{ fontSize: '12px', color: '#666' }}>{debug}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <h1>📊 Your Dashboard</h1>
          <p>Track your electricity bills and savings</p>
          {debug && <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', marginTop: '10px', fontSize: '12px' }}>
            Debug: {debug}
          </div>}
        </div>

        {error && !bills.length && (
          <div className="alert alert-danger">
            {error}
            <button onClick={fetchBills} className="btn btn-sm btn-secondary" style={{ marginLeft: '10px' }}>
              Retry
            </button>
          </div>
        )}

        {bills.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">📋</div>
            <h2>No Bills Yet</h2>
            <p>Start by calculating your first electricity bill on the home page.</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Calculate Bill
            </button>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-details">
                  <h3>Total Bills</h3>
                  <p className="stat-number">{bills.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-details">
                  <h3>Total Saved</h3>
                  <p className="stat-number">
                    ₹{formatCurrency(bills.reduce((sum, bill) => sum + (bill.savings || 0), 0))}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-details">
                  <h3>Average Bill</h3>
                  <p className="stat-number">
                    ₹{formatCurrency(
                      bills.reduce((sum, bill) => sum + (bill.originalBill || 0), 0) / bills.length
                    )}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-details">
                  <h3>Best Saving</h3>
                  <p className="stat-number">
                    ₹{formatCurrency(Math.max(...bills.map(bill => bill.savings || 0)))}
                  </p>
                </div>
              </div>
            </div>

            {/* Bills Table */}
            <div className="card">
              <h2>Your Bills History</h2>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Month/Year</th>
                      <th>Units</th>
                      <th>Rate</th>
                      <th>Original</th>
                      <th>Optimized</th>
                      <th>Savings</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill._id}>
                        <td>{bill.month} {bill.year}</td>
                        <td>{bill.monthlyUnits} kWh</td>
                        <td>₹{bill.ratePerUnit}</td>
                        <td>₹{formatCurrency(bill.originalBill)}</td>
                        <td>₹{formatCurrency(bill.optimizedBill)}</td>
                        <td className="savings-cell">₹{formatCurrency(bill.savings)}</td>
                        <td>
                          <button
                            onClick={() => deleteBill(bill._id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
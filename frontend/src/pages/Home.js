import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    monthlyUnits: '',
    ratePerUnit: '',
  });

  const [appliances, setAppliances] = useState([
    { name: 'AC', quantity: 1, hoursPerDay: 8, wattage: 1500 },
    { name: 'Refrigerator', quantity: 1, hoursPerDay: 24, wattage: 150 },
    { name: 'LED Lights', quantity: 10, hoursPerDay: 6, wattage: 10 },
    { name: 'Fan', quantity: 4, hoursPerDay: 8, wattage: 75 },
    { name: 'TV', quantity: 1, hoursPerDay: 4, wattage: 100 },
  ]);

  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplianceChange = (index, field, value) => {
    const updatedAppliances = [...appliances];
    updatedAppliances[index][field] = value;
    setAppliances(updatedAppliances);
  };

  const addAppliance = () => {
    setAppliances([...appliances, { name: '', quantity: 1, hoursPerDay: 1, wattage: 100 }]);
  };

  const removeAppliance = index => {
    const updatedAppliances = appliances.filter((_, i) => i !== index);
    setAppliances(updatedAppliances);
  };

  // ✅ UPDATED: Calculate bill using /calculate endpoint (NO database save)
  const calculateBill = async () => {
    if (!formData.monthlyUnits || !formData.ratePerUnit) {
      alert('Please enter monthly units and rate per unit');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      // Using /calculate endpoint - this only calculates, doesn't save to DB
      const res = await axios.post('/api/bills/calculate', {
        month: formData.month,
        year: parseInt(formData.year),
        monthlyUnits: parseFloat(formData.monthlyUnits),
        ratePerUnit: parseFloat(formData.ratePerUnit),
        appliances: appliances.filter(a => a.name && a.name.trim() !== ''),
      });

      console.log('Bill calculation:', res.data);

      if (res.data.success) {
        // Store the calculation (no _id field)
        setCalculation(res.data.bill);
        alert('Bill calculated successfully!');
      } else {
        alert(res.data.message || 'Error calculating bill');
      }
    } catch (err) {
      console.error('Calculation error:', err);
      alert(err.response?.data?.message || 'Error calculating bill. Please try again.');
    }
    setLoading(false);
  };

  // ✅ NEW: Save bill using /save endpoint (ONLY saves to database)
  const saveBill = async () => {
    if (!calculation) {
      alert('Please calculate bill first');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Using /save endpoint - this ONLY saves to database
      const res = await axios.post('/api/bills/save', calculation, {
        headers: {
          'x-auth-token': token
        }
      });
      
      console.log('Save response:', res.data);
      
      if (res.data.success) {
        alert('Bill saved to dashboard!');
        navigate('/dashboard');
      } else {
        alert(res.data.message || 'Error saving bill');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert(err.response?.data?.message || 'Error saving bill');
    }
    setLoading(false);
  };

  // Format currency safely
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toFixed(2);
  };

  return (
    <div className="home-page">
      <Navbar />
      <div className="container">
        <div className="home-header">
          <h1>⚡ Electric Bill Optimizer</h1>
          <p>Calculate your electricity bill and get personalized savings suggestions</p>
        </div>

        <div className="home-grid">
          <div className="card bill-input-card">
            <h3>Monthly Usage</h3>
            
            <div className="form-group">
              <label>Month</label>
              <select name="month" value={formData.month} onChange={handleInputChange}>
                {['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="2020"
                max="2030"
              />
            </div>

            <div className="form-group">
              <label>Monthly Electric Units (kWh)</label>
              <input
                type="number"
                name="monthlyUnits"
                value={formData.monthlyUnits}
                onChange={handleInputChange}
                placeholder="e.g., 500"
                required
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Rate per Unit (₹/kWh)</label>
              <input
                type="number"
                name="ratePerUnit"
                value={formData.ratePerUnit}
                onChange={handleInputChange}
                placeholder="e.g., 8.5"
                required
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="card appliances-card">
            <h2>Appliances in Your House</h2>
            
            {/* Header row for appliances */}
            <div className="appliance-header">
              <span className="header-appliance">Appliance</span>
              <span className="header-quantity">Qty</span>
              <span className="header-hours">Hours/Day</span>
              <span className="header-watts">Watts</span>
              <span className="header-action">Action</span>
            </div>
            
            {appliances.map((appliance, index) => (
              <div key={index} className="appliance-item">
                <div className="appliance-row">
                  <input
                    type="text"
                    placeholder="Appliance name"
                    value={appliance.name}
                    onChange={e => handleApplianceChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={appliance.quantity}
                    onChange={e => handleApplianceChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    style={{ width: '70px' }}
                  />
                  <input
                    type="number"
                    placeholder="Hours/day"
                    value={appliance.hoursPerDay}
                    onChange={e => handleApplianceChange(index, 'hoursPerDay', parseInt(e.target.value) || 0)}
                    style={{ width: '100px' }}
                  />
                  <input
                    type="number"
                    placeholder="Watts"
                    value={appliance.wattage}
                    onChange={e => handleApplianceChange(index, 'wattage', parseInt(e.target.value) || 0)}
                    style={{ width: '100px' }}
                  />
                  <button 
                    onClick={() => removeAppliance(index)}
                    className="btn btn-danger btn-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            
            <button onClick={addAppliance} className="btn btn-secondary">
              + Add Appliance
            </button>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={calculateBill} 
            className="btn btn-calculate"
            disabled={loading || !formData.monthlyUnits || !formData.ratePerUnit}
          >
            {loading ? 'Calculating...' : 'Calculate Bill'}
          </button>
        </div>

        {/* Only show results if calculation exists */}
        {calculation && (
          <div className="results-section">
            <div className="bill-summary">
              <div className="summary-card">
                <h3>Original Bill</h3>
                <p className="amount">₹{formatCurrency(calculation.originalBill)}</p>
              </div>
              <div className="summary-card">
                <h3>Optimized Bill</h3>
                <p className="amount savings">₹{formatCurrency(calculation.optimizedBill)}</p>
              </div>
              <div className="summary-card">
                <h3>Total Savings</h3>
                <p className="amount highlight">₹{formatCurrency(calculation.savings)}</p>
              </div>
            </div>

            <div className="suggestions-section">
              <h2>💡 Suggestions to Reduce Your Bill</h2>
              <div className="suggestions-grid">
                {calculation.suggestions && calculation.suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-card">
                    <div className="suggestion-icon">⚡</div>
                    <div className="suggestion-content">
                      <p>{suggestion.text}</p>
                      <span className="suggestion-savings">
                        Potential Savings: ₹{formatCurrency(suggestion.savings)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-20">
              <button 
                onClick={saveBill} 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Saving...' : '💾 Save to Dashboard'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
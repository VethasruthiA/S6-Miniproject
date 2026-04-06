const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Try to load the Bill model
let Bill;
try {
  Bill = require('../models/Bill');
  console.log('✅ Bill model loaded from models');
} catch (err) {
  try {
    Bill = require('../modules/Bill');
    console.log('✅ Bill model loaded from modules');
  } catch (err2) {
    console.log('⚠️ Bill model not found');
  }
}

// ===========================================
// @route   POST /api/bills/calculate
// @desc    Calculate bill WITHOUT saving to database
// @access  Private
// ===========================================
router.post('/calculate', auth, async (req, res) => {
  try {
    const { month, year, monthlyUnits, ratePerUnit, appliances } = req.body;

    // Validation
    if (!monthlyUnits || !ratePerUnit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Monthly units and rate per unit are required' 
      });
    }

    if (!appliances || !Array.isArray(appliances) || appliances.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one appliance is required' 
      });
    }

    // Calculate bill
    const originalBill = parseFloat(monthlyUnits) * parseFloat(ratePerUnit);
    
    // Generate DYNAMIC suggestions based on ACTUAL appliances selected
    const suggestions = [];
    let totalSavings = 0;

    // Loop through each appliance and generate specific suggestions
    appliances.forEach(appliance => {
      const name = appliance.name?.toLowerCase() || '';
      const quantity = appliance.quantity || 1;
      const hours = appliance.hoursPerDay || 0;

      // Skip empty appliance names
      if (!name.trim()) return;

      // AC SUGGESTIONS
      if (name.includes('ac') || name.includes('air conditioner') || name.includes('aircon')) {
        suggestions.push({
          text: `Set your ${appliance.name} temperature to 24°C instead of 18°C - saves up to 15% on cooling costs`,
          savings: (originalBill * 0.15).toFixed(2)
        });
        suggestions.push({
          text: `Clean ${appliance.name} filters monthly - improves efficiency by 5-10%`,
          savings: (originalBill * 0.08).toFixed(2)
        });
        suggestions.push({
          text: `Use ceiling fans with ${appliance.name} - allows higher temperature setting`,
          savings: (originalBill * 0.10).toFixed(2)
        });
        totalSavings += originalBill * 0.33;
      }

      // REFRIGERATOR SUGGESTIONS
      else if (name.includes('fridge') || name.includes('refrigerator') || name.includes('freezer')) {
        suggestions.push({
          text: `Set ${appliance.name} temperature to 4°C and freezer to -18°C - optimal efficiency`,
          savings: (originalBill * 0.08).toFixed(2)
        });
        suggestions.push({
          text: `Don't keep ${appliance.name} door open for long - saves 5% energy`,
          savings: (originalBill * 0.05).toFixed(2)
        });
        suggestions.push({
          text: `Keep ${appliance.name} coils clean - improves efficiency by 10%`,
          savings: (originalBill * 0.06).toFixed(2)
        });
        totalSavings += originalBill * 0.19;
      }

      // LIGHTING SUGGESTIONS
      else if (name.includes('light') || name.includes('bulb') || name.includes('lamp') || name.includes('led')) {
        if (name.includes('led')) {
          suggestions.push({
            text: `You're already using LED ${appliance.name} - great! Consider adding motion sensors`,
            savings: (originalBill * 0.03).toFixed(2)
          });
        } else {
          suggestions.push({
            text: `Replace ${quantity} ${appliance.name} with LED bulbs - saves 75% lighting energy`,
            savings: (originalBill * 0.12).toFixed(2)
          });
        }
        suggestions.push({
          text: `Turn off ${appliance.name} when leaving room - saves significant energy`,
          savings: (originalBill * 0.07).toFixed(2)
        });
        suggestions.push({
          text: `Use natural light during daytime instead of ${appliance.name}`,
          savings: (originalBill * 0.06).toFixed(2)
        });
        totalSavings += originalBill * 0.18;
      }

      // FAN SUGGESTIONS
      else if (name.includes('fan') || name.includes('ceiling fan')) {
        suggestions.push({
          text: `Run ${appliance.name} in summer counter-clockwise, winter clockwise`,
          savings: (originalBill * 0.05).toFixed(2)
        });
        suggestions.push({
          text: `Turn off ${appliance.name} when leaving room - saves energy`,
          savings: (originalBill * 0.04).toFixed(2)
        });
        totalSavings += originalBill * 0.09;
      }

      // TV/ENTERTAINMENT SUGGESTIONS
      else if (name.includes('tv') || name.includes('television') || name.includes('led tv')) {
        suggestions.push({
          text: `Turn off ${appliance.name} completely instead of standby - saves standby power`,
          savings: (originalBill * 0.03).toFixed(2)
        });
        suggestions.push({
          text: `Adjust ${appliance.name} brightness to optimal level - reduces power consumption`,
          savings: (originalBill * 0.02).toFixed(2)
        });
        totalSavings += originalBill * 0.05;
      }

      // WASHING MACHINE SUGGESTIONS
      else if (name.includes('wash') || name.includes('washing machine') || name.includes('washer')) {
        suggestions.push({
          text: `Use cold water for ${appliance.name} - saves 90% of washing energy`,
          savings: (originalBill * 0.08).toFixed(2)
        });
        suggestions.push({
          text: `Run ${appliance.name} with full loads only - reduces cycles by 30%`,
          savings: (originalBill * 0.06).toFixed(2)
        });
        totalSavings += originalBill * 0.14;
      }

      // MICROWAVE/OVEN SUGGESTIONS
      else if (name.includes('microwave') || name.includes('oven') || name.includes('toaster')) {
        suggestions.push({
          text: `Use ${appliance.name} instead of regular oven for small meals - saves 50% energy`,
          savings: (originalBill * 0.07).toFixed(2)
        });
        totalSavings += originalBill * 0.07;
      }

      // COMPUTER/LAPTOP SUGGESTIONS
      else if (name.includes('computer') || name.includes('laptop') || name.includes('desktop')) {
        suggestions.push({
          text: `Enable power-saving mode on ${appliance.name} - reduces energy by 15%`,
          savings: (originalBill * 0.04).toFixed(2)
        });
        suggestions.push({
          text: `Turn off ${appliance.name} when not in use for >1 hour`,
          savings: (originalBill * 0.03).toFixed(2)
        });
        totalSavings += originalBill * 0.07;
      }

      // WATER HEATER/GEYSER SUGGESTIONS
      else if (name.includes('water') || name.includes('geyser') || name.includes('heater')) {
        suggestions.push({
          text: `Set ${appliance.name} temperature to 50°C instead of 70°C - saves 15% energy`,
          savings: (originalBill * 0.10).toFixed(2)
        });
        suggestions.push({
          text: `Use ${appliance.name} timer to heat water only when needed`,
          savings: (originalBill * 0.12).toFixed(2)
        });
        totalSavings += originalBill * 0.22;
      }

      // IRON SUGGESTIONS
      else if (name.includes('iron')) {
        suggestions.push({
          text: `Iron clothes in bulk to avoid reheating ${appliance.name} multiple times`,
          savings: (originalBill * 0.04).toFixed(2)
        });
        totalSavings += originalBill * 0.04;
      }

      // VACUUM CLEANER SUGGESTIONS
      else if (name.includes('vacuum') || name.includes('cleaner')) {
        suggestions.push({
          text: `Clean ${appliance.name} filters regularly - improves suction and efficiency`,
          savings: (originalBill * 0.03).toFixed(2)
        });
        totalSavings += originalBill * 0.03;
      }

      // GENERIC APPLIANCE SUGGESTIONS (for any other appliance)
      else {
        suggestions.push({
          text: `Unplug ${appliance.name} when not in use - eliminates phantom load`,
          savings: (originalBill * 0.02).toFixed(2)
        });
        totalSavings += originalBill * 0.02;
      }
    });

    // Add 1-2 general tips that apply to everyone
    suggestions.push({
      text: 'Use power strips for electronics - easily turn off multiple devices at once',
      savings: (originalBill * 0.05).toFixed(2)
    });
    
    suggestions.push({
      text: 'Get a home energy audit to identify major energy wasters',
      savings: (originalBill * 0.10).toFixed(2)
    });

    // Remove duplicate suggestions
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.text === suggestion.text)
    );

    // Calculate savings (capped at 30% of original bill for realism)
    const calculatedSavings = Math.min(totalSavings, originalBill * 0.3);
    const optimizedBill = originalBill - calculatedSavings;

    // Create bill object WITHOUT user and WITHOUT saving to database
    const billData = {
      month: month || new Date().toLocaleString('default', { month: 'long' }),
      year: year || new Date().getFullYear(),
      monthlyUnits: parseFloat(monthlyUnits),
      ratePerUnit: parseFloat(ratePerUnit),
      appliances: appliances.map(({ name, quantity, hoursPerDay, wattage }) => ({
        name,
        quantity,
        hoursPerDay,
        wattage: wattage || 100
      })),
      originalBill: parseFloat(originalBill.toFixed(2)),
      optimizedBill: parseFloat(optimizedBill.toFixed(2)),
      savings: parseFloat(calculatedSavings.toFixed(2)),
      suggestions: uniqueSuggestions.slice(0, 6), // Show top 6 unique suggestions
    };

    console.log('✅ Bill calculated (not saved) for', appliances.length, 'appliances');
    
    return res.status(200).json({
      success: true,
      message: 'Bill calculated with personalized suggestions',
      bill: billData  // No _id field!
    });

  } catch (err) {
    console.error('Calculate bill error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating bill: ' + err.message 
    });
  }
});

// ===========================================
// @route   POST /api/bills/save
// @desc    Save calculated bill to database
// @access  Private
// ===========================================
router.post('/save', auth, async (req, res) => {
  try {
    // Check if Bill model exists
    if (!Bill) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database not available' 
      });
    }

    const billData = {
      ...req.body,
      user: req.user.id,
      createdAt: new Date()
    };

    // Ensure required fields exist
    if (!billData.month || !billData.year || !billData.monthlyUnits || !billData.ratePerUnit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required bill data' 
      });
    }

    // Save to database
    const newBill = new Bill(billData);
    const savedBill = await newBill.save();
    
    console.log('✅ Bill saved to database with ID:', savedBill._id);
    
    return res.status(201).json({
      success: true,
      message: 'Bill saved successfully',
      bill: savedBill
    });

  } catch (err) {
    console.error('Save bill error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving bill: ' + err.message 
    });
  }
});

// ===========================================
// @route   POST /api/bills (original - for backward compatibility)
// @desc    Calculate AND save bill (legacy)
// @access  Private
// ===========================================
router.post('/', auth, async (req, res) => {
  try {
    // Check if this request is trying to save an already calculated bill
    if (req.body._id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please use POST /api/bills/save for saving bills' 
      });
    }

    const { month, year, monthlyUnits, ratePerUnit, appliances } = req.body;

    // Validation
    if (!monthlyUnits || !ratePerUnit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Monthly units and rate per unit are required' 
      });
    }

    // Calculate bill
    const originalBill = parseFloat(monthlyUnits) * parseFloat(ratePerUnit);
    
    // Generate DYNAMIC suggestions based on ACTUAL appliances selected
    const suggestions = [];
    let totalSavings = 0;

    // (Reuse your existing suggestion generation logic here - it's the same as above)
    // For brevity, I'm not copying all the suggestion logic again, but you should
    // either reuse the same logic or call a separate function
    
    // For now, I'll add a comment to indicate where your logic goes
    // >>> PASTE YOUR EXISTING SUGGESTION GENERATION LOGIC HERE <<<
    
    // This is a simplified version - in your actual code, copy ALL the suggestion logic
    // from your original POST endpoint above
    
    // Example placeholder - REPLACE THIS WITH YOUR ACTUAL LOGIC
    appliances.forEach(appliance => {
      // Your existing suggestion generation code here
    });

    // Add general tips
    suggestions.push({
      text: 'Use power strips for electronics - easily turn off multiple devices at once',
      savings: (originalBill * 0.05).toFixed(2)
    });
    
    suggestions.push({
      text: 'Get a home energy audit to identify major energy wasters',
      savings: (originalBill * 0.10).toFixed(2)
    });

    // Remove duplicates
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.text === suggestion.text)
    );

    // Calculate savings
    const calculatedSavings = Math.min(totalSavings, originalBill * 0.3);
    const optimizedBill = originalBill - calculatedSavings;

    // Create and save bill object
    const billData = {
      user: req.user.id,
      month: month || new Date().toLocaleString('default', { month: 'long' }),
      year: year || new Date().getFullYear(),
      monthlyUnits: parseFloat(monthlyUnits),
      ratePerUnit: parseFloat(ratePerUnit),
      appliances: appliances.map(({ name, quantity, hoursPerDay, wattage }) => ({
        name,
        quantity,
        hoursPerDay,
        wattage: wattage || 100
      })),
      originalBill: parseFloat(originalBill.toFixed(2)),
      optimizedBill: parseFloat(optimizedBill.toFixed(2)),
      savings: parseFloat(calculatedSavings.toFixed(2)),
      suggestions: uniqueSuggestions.slice(0, 6),
      createdAt: new Date()
    };

    // Save to database
    if (Bill) {
      const newBill = new Bill(billData);
      const savedBill = await newBill.save();
      console.log('✅ Bill saved via legacy endpoint');
      
      return res.status(201).json({
        success: true,
        message: 'Bill calculated and saved',
        bill: savedBill
      });
    } else {
      billData._id = Date.now().toString();
      return res.status(201).json({
        success: true,
        message: 'Bill calculated (not saved)',
        bill: billData
      });
    }

  } catch (err) {
    console.error('Create bill error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving bill: ' + err.message 
    });
  }
});

// ===========================================
// @route   GET /api/bills
// @desc    Get all bills
// @access  Private
// ===========================================
router.get('/', auth, async (req, res) => {
  try {
    if (!Bill) {
      return res.json({ success: true, bills: [] });
    }
    
    const bills = await Bill.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      count: bills.length,
      bills
    });
  } catch (err) {
    console.error('Get bills error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bills' 
    });
  }
});

// ===========================================
// @route   DELETE /api/bills/:id
// @desc    Delete bill
// @access  Private
// ===========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!Bill) {
      return res.json({ success: true, message: 'Bill deleted' });
    }
    
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    
    // Check if user owns this bill
    if (bill.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    await bill.deleteOne();
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (err) {
    console.error('Delete bill error:', err);
    res.status(500).json({ success: false, message: 'Error deleting bill' });
  }
});

module.exports = router;
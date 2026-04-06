const mongoose = require('mongoose');

const ApplianceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide appliance name'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  hoursPerDay: {
    type: Number,
    required: [true, 'Please provide hours per day'],
    min: [0, 'Hours cannot be negative'],
    max: [24, 'Hours cannot exceed 24'],
    default: 1
  },
  wattage: {
    type: Number,
    required: [true, 'Please provide wattage'],
    min: [0, 'Wattage cannot be negative'],
    default: 100
  }
});

const SuggestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  savings: {
    type: Number,
    required: true,
    min: 0
  }
});

const BillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  month: {
    type: String,
    required: [true, 'Please provide month'],
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: Number,
    required: [true, 'Please provide year'],
    min: [2000, 'Year must be 2000 or later'],
    max: [2100, 'Year cannot exceed 2100']
  },
  monthlyUnits: {
    type: Number,
    required: [true, 'Please provide monthly units'],
    min: [0, 'Monthly units cannot be negative']
  },
  ratePerUnit: {
    type: Number,
    required: [true, 'Please provide rate per unit'],
    min: [0, 'Rate per unit cannot be negative']
  },
  appliances: {
    type: [ApplianceSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one appliance is required'
    }
  },
  originalBill: {
    type: Number,
    required: true,
    min: 0
  },
  optimizedBill: {
    type: Number,
    required: true,
    min: 0
  },
  savings: {
    type: Number,
    required: true,
    min: 0
  },
  suggestions: {
    type: [SuggestionSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one suggestion is required'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for finding bills by user, year, month
BillSchema.index({ user: 1, year: -1, month: 1 });

module.exports = mongoose.model('Bill', BillSchema);
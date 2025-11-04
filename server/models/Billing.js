const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  billingPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  usageDetails: {
    totalHours: {
      type: Number,
      default: 0
    },
    firstSwitchOn: {
      type: Date
    },
    lastSwitchOff: {
      type: Date
    },
    dailyUsage: [{
      date: {
        type: Date
      },
      hoursUsed: {
        type: Number
      }
    }]
  },
  rentalDetails: {
    isRental: {
      type: Boolean,
      default: false
    },
    rentalStartDate: {
      type: Date
    },
    rentalEndDate: {
      type: Date
    },
    rentalRate: {
      type: Number
    },
    rentalPeriod: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly']
    }
  },
  invoiceDetails: {
    invoiceNumber: {
      type: String
    },
    invoiceDate: {
      type: Date
    },
    dueDate: {
      type: Date
    },
    amount: {
      type: Number
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft'
    }
  },
  paymentDetails: {
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'check', 'cash']
    },
    paymentDate: {
      type: Date
    },
    transactionId: {
      type: String
    },
    amountPaid: {
      type: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Billing', BillingSchema);
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Billing = require('../models/Billing');
const Device = require('../models/Device');

// @route   GET api/billing
// @desc    Get all billing records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const billingRecords = await Billing.find().sort({ 'billingPeriod.endDate': -1 });
    res.json(billingRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/billing/:id
// @desc    Get billing record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const billingRecord = await Billing.findById(req.params.id);
    
    if (!billingRecord) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    
    res.json(billingRecord);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/billing
// @desc    Create a billing record
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      deviceId,
      billingPeriod,
      usageDetails,
      rentalDetails,
      invoiceDetails,
      paymentDetails
    } = req.body;

    // Create new billing record
    const newBillingRecord = new Billing({
      customerId,
      customerName,
      deviceId,
      billingPeriod,
      usageDetails,
      rentalDetails,
      invoiceDetails,
      paymentDetails
    });

    const billingRecord = await newBillingRecord.save();
    res.json(billingRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/billing/:id
// @desc    Update a billing record
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const billingRecord = await Billing.findById(req.params.id);
    
    if (!billingRecord) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    
    // Update fields
    const updateFields = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    // Update billing record
    const updatedBillingRecord = await Billing.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json(updatedBillingRecord);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/billing/:id
// @desc    Delete a billing record
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const billingRecord = await Billing.findById(req.params.id);
    
    if (!billingRecord) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    
    await billingRecord.remove();
    res.json({ message: 'Billing record removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/billing/customer/:customerId
// @desc    Get billing records by customer ID
// @access  Private
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const billingRecords = await Billing.find({ customerId: req.params.customerId })
      .sort({ 'billingPeriod.endDate': -1 });
    res.json(billingRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/billing/device/:deviceId
// @desc    Get billing records by device ID
// @access  Private
router.get('/device/:deviceId', auth, async (req, res) => {
  try {
    const billingRecords = await Billing.find({ deviceId: req.params.deviceId })
      .sort({ 'billingPeriod.endDate': -1 });
    res.json(billingRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/billing/status/:status
// @desc    Get billing records by invoice status
// @access  Private
router.get('/status/:status', auth, async (req, res) => {
  try {
    const billingRecords = await Billing.find({ 'invoiceDetails.status': req.params.status })
      .sort({ 'billingPeriod.endDate': -1 });
    res.json(billingRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/billing/:id/payment
// @desc    Update payment details for a billing record
// @access  Private
router.put('/:id/payment', auth, async (req, res) => {
  try {
    const billingRecord = await Billing.findById(req.params.id);
    
    if (!billingRecord) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    
    // Update payment details
    const paymentDetails = {
      ...req.body,
      paymentDate: req.body.paymentDate || Date.now()
    };
    
    // Update invoice status if payment is complete
    let invoiceDetails = { ...billingRecord.invoiceDetails };
    if (paymentDetails.amountPaid >= billingRecord.invoiceDetails.amount) {
      invoiceDetails.status = 'paid';
    }
    
    // Update billing record
    const updatedBillingRecord = await Billing.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          paymentDetails,
          invoiceDetails,
          updatedAt: Date.now()
        } 
      },
      { new: true }
    );
    
    res.json(updatedBillingRecord);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/billing/period
// @desc    Get billing records by date range
// @access  Private
router.get('/period', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const billingRecords = await Billing.find({
      'billingPeriod.startDate': { $gte: new Date(startDate) },
      'billingPeriod.endDate': { $lte: new Date(endDate) }
    }).sort({ 'billingPeriod.endDate': -1 });
    
    res.json(billingRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction.model');
const { uuid } = require('uuidv4');
const transactions = require('../store/transactionStorage');
const locationMap = require('../models/location.map');
const { exists, getLocationId } = require('./service/service-functions');


router.get('/', function (req, res) {
  res.json({ title: 'Index Page' });
});

// Endpoint to save transaction details
router.post('/transactions', async (req, res) => {
  const transaction = req.body;

  // Add unique uuid to the transaction
  transaction.id = uuid();

  if(transaction.location) {
    let location = JSON.parse(JSON.stringify(transaction.location));
    if(exists(locationMap, location)) {
        transaction.location.id = getLocationId(locationMap, location);
    } else {
        locationMap.set(location, locationMap.size + 1);
        transaction.location.id = locationMap.size;
    }
  }
  

  // Check if the user already exists in the transactions array
  const existingUser = transactions.find(t => t.userId === transaction.userId);
  
  if (existingUser && existingUser.userName != transaction.userName) {
    return res.status(400).send('User ID already exists with a different username');
  }

  // Call Model static method for Adding the transaction to the transactions array
    try{
        const postTransaction = new Transaction(transaction);
        console.log(postTransaction.validateSync());
        const validateSchemaError = postTransaction.validateSync();
        if(validateSchemaError) {
            throw 'Schema Validation failed';
        }
        const newTransaction = await Transaction.addTransaction(postTransaction);
        res.status(201).json(newTransaction);
    } catch(error) {
        res.status(500).json({error});
        console.error(`Error saving transaction: ${error}`);
        throw new Error('Failed to save transaction');
    }
});

// Endpoint to fetch transaction details with txnType & page as queryParams
router.get('/transactions', async (req, res) => {
    try {
        const { txnType, page } = req.query;
        const result = await Transaction.fetchTransactions(txnType, page, req.query.perPage);
        res.json(result);
    } catch(error) {
        console.error(`Error fetching transaction: ${error}`);
        throw new Error('Failed to fetch transaction');
    }
});

// Endpoint to get total transactions based on location id and txnType
router.get('/total-transactions', async (req, res) => {
    try {
        const { locationId, txnType } = req.query;

        const result = await Transaction.getTotalTransactions(locationId, txnType);
        // Return the results as a 2d array
        if (result.length === 0) {
            res.status(404).json([[-1, -1]]);
        } else {
            res.json(result);
        }
    } catch(error) {
        console.error(`Error getting total transactions: ${error}`);
        throw new Error('Failed to get total transactions');
    }
    
  });

module.exports = router;
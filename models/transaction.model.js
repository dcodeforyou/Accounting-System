const mongoose = require('mongoose');
const transactions = require('../store/transactionStorage');

const locationSchema = new mongoose.Schema({
  id: {
    type: String
  },
  address: String,
  city: String,
  zipCode: String
});

const transactionSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  userId: {
    type: Number,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  txnType: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
  },
  amount: {
    type: String,
    default: '$0'
  },
  location: {
    type: locationSchema,
    required: true
  },
  ip: String
});

transactionSchema.statics.addTransaction = async function(transaction) {
    try {
        transactions.push(transaction);
        return transaction;
    } catch (error) {
        console.error(`Error saving transaction: ${error}`);
        throw new Error('Failed to save transaction');
    }
}

transactionSchema.statics.fetchTransactions = async function(txnType, page, perPage = 10) {
    // Default to 10 records per page
    // console.log(perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    console.log(startIndex, endIndex);
  
    const filteredTransactions = transactions.filter(t => t.txnType === txnType);
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  
    const total = filteredTransactions.length;
    const totalPages = Math.ceil(total / perPage);
  
    const response = {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
      data: paginatedTransactions
    };

    return response;
}

transactionSchema.statics.getTotalTransactions = async function(locationId, transactionType) {
    const totalTransactions = transactions.filter(t => {
        return t.txnType == transactionType && t.location.id == locationId;
    });
  
    // Group the transactions by user ID and compute the total amount spent by each user
    const totals = {};
    totalTransactions.forEach((transaction) => {
      const userId = transaction.userId;
      const amount = parseFloat(transaction.amount.split("$")[1]);
      if (!totals[userId]) {
        totals[userId] = 0;
      }
      if (transaction.txnType === 'debit') {
        totals[userId] -= amount;
      } else {
        totals[userId] += amount;
      }
    });
  
    // Sort the results by user ID
    const result = Object.keys(totals)
      .map((userId) => [parseInt(userId), Math.trunc(totals[userId])])
      .sort((a, b) => a[0] - b[0]);

    return result;
}

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

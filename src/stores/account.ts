import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Account {
  id: string
  type: 'savings' | 'checking' | 'investment'
  name: string
  balance: number
  currency: string
}

interface Transaction {
  id: string
  accountId: string
  type: 'deposit' | 'withdrawal' | 'transfer'
  amount: number
  description: string
  date: Date
  status: 'completed' | 'pending' | 'failed'
}

export const useAccountStore = defineStore('account', () => {
  // State
  const accounts = ref<Account[]>([
    {
      id: '1',
      type: 'savings',
      name: 'Main Savings',
      balance: 15000,
      currency: 'USD'
    },
    {
      id: '2',
      type: 'checking',
      name: 'Daily Expenses',
      balance: 2500,
      currency: 'USD'
    },
    {
      id: '3',
      type: 'investment',
      name: 'Investment Portfolio',
      balance: 45000,
      currency: 'USD'
    }
  ])

  const transactions = ref<Transaction[]>([
    {
      id: 't1',
      accountId: '1',
      type: 'deposit',
      amount: 1000,
      description: 'Monthly salary',
      date: new Date('2025-08-20'),
      status: 'completed'
    },
    {
      id: 't2',
      accountId: '2',
      type: 'withdrawal',
      amount: 50,
      description: 'Grocery shopping',
      date: new Date('2025-08-22'),
      status: 'completed'
    },
    {
      id: 't3',
      accountId: '3',
      type: 'deposit',
      amount: 5000,
      description: 'Investment contribution',
      date: new Date('2025-08-15'),
      status: 'completed'
    }
  ])

  const loading = ref(false)

  // Getters
  const totalBalance = computed(() => 
    accounts.value.reduce((sum, account) => sum + account.balance, 0)
  )

  const savingsBalance = computed(() => 
    accounts.value
      .filter(account => account.type === 'savings')
      .reduce((sum, account) => sum + account.balance, 0)
  )

  const checkingBalance = computed(() => 
    accounts.value
      .filter(account => account.type === 'checking')
      .reduce((sum, account) => sum + account.balance, 0)
  )

  const investmentBalance = computed(() => 
    accounts.value
      .filter(account => account.type === 'investment')
      .reduce((sum, account) => sum + account.balance, 0)
  )

  const recentTransactions = computed(() => 
    transactions.value
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
  )

  // Actions
  function addAccount(accountData: Omit<Account, 'id'>) {
    const newAccount: Account = {
      ...accountData,
      id: Date.now().toString()
    }
    accounts.value.push(newAccount)
    return newAccount
  }

  function updateAccountBalance(accountId: string, newBalance: number) {
    const account = accounts.value.find(acc => acc.id === accountId)
    if (account) {
      account.balance = newBalance
    }
  }

  function addTransaction(transactionData: Omit<Transaction, 'id' | 'date' | 'status'>) {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      date: new Date(),
      status: 'pending'
    }
    
    transactions.value.push(newTransaction)
    
    // Simulate processing
    setTimeout(() => {
      newTransaction.status = 'completed'
      
      // Update account balance
      const account = accounts.value.find(acc => acc.id === transactionData.accountId)
      if (account) {
        if (transactionData.type === 'deposit') {
          account.balance += transactionData.amount
        } else if (transactionData.type === 'withdrawal') {
          account.balance -= transactionData.amount
        }
      }
    }, 1500)
    
    return newTransaction
  }

  function getAccountById(id: string) {
    return accounts.value.find(account => account.id === id)
  }

  function getTransactionsByAccount(accountId: string) {
    return transactions.value.filter(transaction => transaction.accountId === accountId)
  }

  async function refreshAccounts() {
    loading.value = true
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        loading.value = false
        resolve(accounts.value)
      }, 1000)
    })
  }

  return {
    // State
    accounts,
    transactions,
    loading,
    // Getters
    totalBalance,
    savingsBalance,
    checkingBalance,
    investmentBalance,
    recentTransactions,
    // Actions
    addAccount,
    updateAccountBalance,
    addTransaction,
    getAccountById,
    getTransactionsByAccount,
    refreshAccounts
  }
})

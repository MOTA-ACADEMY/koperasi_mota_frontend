<template>
  <Card class="p-6">
    <div class="space-y-6">
      <!-- User Info Section -->
      <div class="border-b pb-4">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
          👤 User Information
          <Badge v-if="userStore.user.isAuthenticated" variant="default" class="text-xs">
            {{ userStore.roleLabel }}
          </Badge>
        </h3>
        
        <div v-if="!userStore.user.isAuthenticated" class="space-y-3">
          <p class="text-muted-foreground">Please log in to view your account information.</p>
          <div class="flex gap-2">
            <Button @click="handleLogin" :disabled="userStore.loading">
              {{ userStore.loading ? 'Logging in...' : 'Demo Login' }}
            </Button>
          </div>
        </div>
        
        <div v-else class="space-y-2">
          <p><strong>Name:</strong> {{ userStore.fullUserInfo.displayName }}</p>
          <p><strong>Email:</strong> {{ userStore.user.email }}</p>
          <p><strong>Role:</strong> {{ userStore.roleLabel }}</p>
          <Button variant="outline" size="sm" @click="userStore.logout">
            Logout
          </Button>
        </div>
        
        <div v-if="userStore.error" class="mt-3">
          <Badge variant="destructive" class="text-xs">{{ userStore.error }}</Badge>
        </div>
      </div>

      <!-- Account Summary Section -->
      <div v-if="userStore.user.isAuthenticated">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
          💰 Account Summary
          <Button 
            variant="outline" 
            size="sm" 
            @click="accountStore.refreshAccounts"
            :disabled="accountStore.loading"
          >
            {{ accountStore.loading ? 'Refreshing...' : 'Refresh' }}
          </Button>
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card class="p-4 bg-green-50 border-green-200">
            <div class="text-sm text-green-600">Total Balance</div>
            <div class="text-2xl font-bold text-green-700">
              ${{ accountStore.totalBalance.toLocaleString() }}
            </div>
          </Card>
          
          <Card class="p-4 bg-blue-50 border-blue-200">
            <div class="text-sm text-blue-600">Savings</div>
            <div class="text-2xl font-bold text-blue-700">
              ${{ accountStore.savingsBalance.toLocaleString() }}
            </div>
          </Card>
          
          <Card class="p-4 bg-purple-50 border-purple-200">
            <div class="text-sm text-purple-600">Investments</div>
            <div class="text-2xl font-bold text-purple-700">
              ${{ accountStore.investmentBalance.toLocaleString() }}
            </div>
          </Card>
        </div>

        <!-- Accounts List -->
        <div class="space-y-3">
          <h4 class="font-medium">Your Accounts</h4>
          <div v-for="account in accountStore.accounts" :key="account.id" 
               class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <div class="font-medium">{{ account.name }}</div>
              <Badge variant="outline" class="text-xs capitalize">{{ account.type }}</Badge>
            </div>
            <div class="text-right">
              <div class="font-semibold">${{ account.balance.toLocaleString() }}</div>
              <div class="text-sm text-muted-foreground">{{ account.currency }}</div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="space-y-3 mt-6">
          <h4 class="font-medium">Recent Transactions</h4>
          <div v-for="transaction in accountStore.recentTransactions" :key="transaction.id" 
               class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <div class="font-medium">{{ transaction.description }}</div>
              <div class="text-sm text-muted-foreground">
                {{ transaction.date.toLocaleDateString() }}
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold" :class="{
                'text-green-600': transaction.type === 'deposit',
                'text-red-600': transaction.type === 'withdrawal',
                'text-blue-600': transaction.type === 'transfer'
              }">
                {{ transaction.type === 'deposit' ? '+' : '-' }}${{ transaction.amount.toLocaleString() }}
              </div>
              <Badge 
                :variant="transaction.status === 'completed' ? 'default' : 'secondary'" 
                class="text-xs"
              >
                {{ transaction.status }}
              </Badge>
            </div>
          </div>
        </div>

        <!-- Demo Actions -->
        <div class="flex gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" size="sm" @click="addDemoTransaction('deposit')">
            Add Demo Deposit
          </Button>
          <Button variant="outline" size="sm" @click="addDemoTransaction('withdrawal')">
            Add Demo Withdrawal
          </Button>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { useUserStore, useAccountStore } from '@/stores'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'

const userStore = useUserStore()
const accountStore = useAccountStore()

async function handleLogin() {
  try {
    await userStore.login({
      email: 'demo@koperasi-mota.com',
      password: 'demo123'
    })
  } catch (error) {
    console.error('Login failed:', error)
  }
}

function addDemoTransaction(type: 'deposit' | 'withdrawal') {
  const amounts = [100, 250, 500, 1000]
  const descriptions = {
    deposit: ['Salary deposit', 'Bonus payment', 'Interest earned', 'Transfer received'],
    withdrawal: ['ATM withdrawal', 'Online purchase', 'Bill payment', 'Transfer sent']
  }
  
  const randomAmount = amounts[Math.floor(Math.random() * amounts.length)]
  const randomDescription = descriptions[type][Math.floor(Math.random() * descriptions[type].length)]
  const randomAccountId = accountStore.accounts[Math.floor(Math.random() * accountStore.accounts.length)].id
  
  accountStore.addTransaction({
    accountId: randomAccountId,
    type,
    amount: randomAmount,
    description: randomDescription
  })
}
</script>

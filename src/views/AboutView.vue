<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <Badge variant="outline" class="mb-4">About Us</Badge>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">About Koperasi Mota</h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Modernizing cooperative management through innovative technology solutions
          </p>
        </div>

        <!-- Mission Section -->
        <Card class="p-8 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div class="flex items-start space-x-4">
            <Avatar class="h-12 w-12">
              <AvatarFallback class="bg-blue-500 text-white">🎯</AvatarFallback>
            </Avatar>
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p class="text-gray-600 leading-relaxed">
                Koperasi Mota is dedicated to modernizing cooperative management through 
                innovative technology solutions. We provide tools that help cooperatives 
                manage their operations efficiently and transparently, empowering communities 
                to achieve their financial goals together.
              </p>
            </div>
          </div>
        </Card>

        <!-- Technology Stack -->
        <Card class="p-8 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Avatar class="h-10 w-10">
              <AvatarFallback class="bg-purple-500 text-white">⚡</AvatarFallback>
            </Avatar>
            Technology Stack
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex items-center space-x-2">
                <Badge variant="default">Frontend</Badge>
              </div>
              <ul class="space-y-2 text-gray-600">
                <li class="flex items-center space-x-2">
                  <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Vue.js 3 with Composition API</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>TypeScript for type safety</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Pinia for state management</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Vue Router for navigation</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>Vite for fast development</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="w-2 h-2 bg-teal-500 rounded-full"></span>
                  <span>Shadcn/ui + Tailwind CSS</span>
                </li>
              </ul>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center space-x-2">
                <Badge variant="secondary">Backend (Future)</Badge>
              </div>
              <ul class="space-y-2 text-gray-600">
                <li class="flex items-center space-x-2">
                  <span class="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  <span>Go (Golang) for high performance</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span>RESTful API architecture</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="w-2 h-2 bg-pink-500 rounded-full"></span>
                  <span>Microservices design</span>
                </li>
                <li class="flex items-center space-x-2">
                  <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Database integration</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <!-- Features -->
        <Card class="p-8 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Avatar class="h-10 w-10">
              <AvatarFallback class="bg-green-500 text-white">🚀</AvatarFallback>
            </Avatar>
            Features
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="feature in features" :key="feature.name" 
                 class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar class="h-8 w-8">
                <AvatarFallback :class="feature.color + ' text-white text-sm'">
                  {{ feature.icon }}
                </AvatarFallback>
              </Avatar>
              <span class="text-gray-700">{{ feature.name }}</span>
            </div>
          </div>
        </Card>

        <!-- Pinia State Management Demo -->
        <div class="mb-8">
          <div class="text-center mb-6">
            <Badge variant="default" class="mb-2">Live Demo</Badge>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Pinia State Management</h2>
            <p class="text-gray-600">
              Experience our state management system in action. Try logging in and see real-time updates!
            </p>
          </div>
          <PiniaDemo />
        </div>

        <!-- Call to Action -->
        <Card class="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
          <div class="text-center">
            <h2 class="text-2xl font-bold mb-4">Ready to Transform Your Cooperative?</h2>
            <p class="text-lg opacity-90 mb-6">
              Join the future of cooperative management with our modern technology stack.
            </p>
            <div class="flex justify-center space-x-4">
              <Button size="lg" variant="outline" class="bg-white text-blue-600 hover:bg-gray-50">
                Get Started
              </Button>
              <Button size="lg" class="bg-white/20 text-white border-white hover:bg-white/30" 
                      @click="$router.push('/')">
                Back to Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AvatarFallback from '@/components/ui/AvatarFallback.vue'
import PiniaDemo from '@/components/PiniaDemo.vue'

const features = [
  { name: 'Member Management', icon: '👥', color: 'bg-blue-500' },
  { name: 'Financial Tracking', icon: '💰', color: 'bg-green-500' },
  { name: 'Loan Management', icon: '🏦', color: 'bg-purple-500' },
  { name: 'Reporting & Analytics', icon: '📊', color: 'bg-orange-500' },
  { name: 'Mobile Responsive', icon: '📱', color: 'bg-teal-500' },
  { name: 'Real-time Updates', icon: '⚡', color: 'bg-red-500' },
]
</script>

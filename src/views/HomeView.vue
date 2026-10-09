<template>
  <div class="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
    <!-- Navigation -->
    <nav class="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <Avatar class="h-10 w-10">
            <AvatarImage src="/logo.png" alt="Koperasi Mota" />
            <AvatarFallback class="bg-blue-600 text-white font-semibold">KM</AvatarFallback>
          </Avatar>
          <h1 class="text-xl font-bold text-gray-900">Koperasi Mota</h1>
          <Badge variant="secondary" class="ml-2">Trusted</Badge>
        </div>
        <div class="flex items-center space-x-4">
          <Button variant="outline" size="sm">Login</Button>
          <Button size="sm">Join Now</Button>
        </div>
      </div>
    </nav>

    <main>
      <!-- Hero section -->
      <div class="relative isolate px-6 pt-14 lg:px-8">
        <div
          class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style="
              clip-path: polygon(
                74.1% 44.1%,
                100% 61.6%,
                97.5% 26.9%,
                85.5% 0.1%,
                80.7% 2%,
                72.5% 32.5%,
                60.2% 62.4%,
                52.4% 68.1%,
                47.5% 58.3%,
                45.2% 34.5%,
                27.5% 76.7%,
                0.1% 64.9%,
                17.9% 100%,
                27.6% 76.8%,
                76.1% 97.7%,
                74.1% 44.1%
              );
            "
          />
        </div>
        <div class="mx-auto max-w-4xl py-20 sm:py-32 lg:py-40">
          <div class="text-center">
            <div class="flex justify-center mb-8">
              <Badge variant="outline" class="px-4 py-2 text-sm">
                🏆 #1 Cooperative in Indonesia
              </Badge>
            </div>
            <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Your Trusted
              <span class="text-blue-600">Financial</span>
              Partner
            </h1>
            <p class="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
              Join our cooperative community and unlock financial opportunities. From savings to investments, 
              we're here to help you build a prosperous future.
            </p>
            <div class="mt-10 flex items-center justify-center gap-x-6 flex-wrap">
              <Button size="lg" class="text-lg px-8 py-4" @click="$router.push('/dashboard')">
                View Dashboard
              </Button>
              <Button variant="outline" size="lg" class="text-lg px-8 py-4">
                Learn More
              </Button>
            </div>
            
            <!-- Stats -->
            <div class="mt-16 flex justify-center">
              <Card class="p-8 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <div class="grid grid-cols-3 gap-8 text-center">
                  <div>
                    <div class="text-3xl font-bold text-blue-600">50K+</div>
                    <div class="text-sm text-gray-600">Members</div>
                  </div>
                  <Separator orientation="vertical" class="h-16 w-px bg-gray-300" />
                  <div>
                    <div class="text-3xl font-bold text-green-600">$2.5B</div>
                    <div class="text-sm text-gray-600">Assets</div>
                  </div>
                  <Separator orientation="vertical" class="h-16 w-px bg-gray-300" />
                  <div>
                    <div class="text-3xl font-bold text-purple-600">25+</div>
                    <div class="text-sm text-gray-600">Years</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <!-- Team/Trust section -->
      <div class="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <Card class="p-8 bg-white shadow-xl border-0">
          <div class="text-center mb-12">
            <Badge variant="secondary" class="mb-4">Our Leadership</Badge>
            <h2 class="text-3xl font-bold text-gray-900">Meet Our Expert Team</h2>
            <p class="mt-4 text-lg text-gray-600">
              Experienced professionals dedicated to your financial success
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="member in teamMembers" :key="member.name" class="text-center">
              <Avatar class="h-20 w-20 mx-auto mb-4">
                <AvatarImage :src="member.image" :alt="member.name" />
                <AvatarFallback class="bg-blue-100 text-blue-700 text-lg font-semibold">
                  {{ member.initials }}
                </AvatarFallback>
              </Avatar>
              <h3 class="text-xl font-semibold text-gray-900">{{ member.name }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ member.role }}</p>
              <Badge variant="outline" class="text-xs">{{ member.experience }}</Badge>
            </div>
          </div>
        </Card>
      </div>

      <!-- Feature section -->
      <div class="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div class="mx-auto max-w-2xl lg:text-center mb-16">
          <Badge variant="default" class="mb-4">Our Services</Badge>
          <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage your finances
          </h2>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            From savings accounts to business loans, we provide comprehensive financial services tailored to your needs.
          </p>
        </div>
        
        <div class="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2 mx-auto">
          <Card v-for="feature in features" :key="feature.name" 
                class="p-8 hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <Avatar class="h-12 w-12">
                  <AvatarFallback :class="feature.bgColor + ' text-white'">
                    {{ feature.icon }}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ feature.name }}</h3>
                  <Badge :variant="feature.badge.variant" class="text-xs">
                    {{ feature.badge.text }}
                  </Badge>
                </div>
                <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
                <Button variant="outline" size="sm" class="mt-4">
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <Card class="p-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p class="text-xl opacity-90 mb-8">
              Start your financial journey with Koperasi Mota today and discover the benefits of cooperative banking.
            </p>
            <div class="flex justify-center space-x-4">
              <Button size="lg" variant="outline" class="bg-white text-blue-600 hover:bg-gray-50">
                Open Account
              </Button>
              <Button size="lg" class="bg-white/20 text-white border-white hover:bg-white/30">
                Contact Us
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AvatarImage from '@/components/ui/AvatarImage.vue'
import AvatarFallback from '@/components/ui/AvatarFallback.vue'
import Separator from '@/components/ui/Separator.vue'

interface TeamMember {
  name: string
  role: string
  experience: string
  initials: string
  image: string
}

interface Feature {
  name: string
  description: string
  icon: string
  bgColor: string
  badge: {
    variant: 'default' | 'secondary' | 'outline'
    text: string
  }
}

const teamMembers: TeamMember[] = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Chief Executive Officer',
    experience: '15+ Years',
    initials: 'SJ',
    image: '/team/sarah.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Chief Financial Officer',
    experience: '12+ Years',
    initials: 'MC',
    image: '/team/michael.jpg'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Operations',
    experience: '10+ Years',
    initials: 'ER',
    image: '/team/emily.jpg'
  },
]

const features: Feature[] = [
  {
    name: 'Savings Account',
    description: 'Secure savings with competitive interest rates up to 4.5% annually and flexible withdrawal options. No minimum balance required.',
    icon: '💰',
    bgColor: 'bg-green-500',
    badge: { variant: 'default', text: 'Popular' }
  },
  {
    name: 'Business Loans',
    description: 'Grow your business with our tailored loan solutions starting from 2.9% APR and expert financial advice from our specialists.',
    icon: '🏢',
    bgColor: 'bg-blue-500',
    badge: { variant: 'secondary', text: 'Low Interest' }
  },
  {
    name: 'Investment Services',
    description: 'Build wealth through our diverse investment portfolio with professional guidance and risk management strategies.',
    icon: '📈',
    bgColor: 'bg-purple-500',
    badge: { variant: 'outline', text: 'High Returns' }
  },
  {
    name: 'Financial Planning',
    description: 'Plan for your future with our comprehensive financial planning services including retirement and education funding.',
    icon: '📊',
    bgColor: 'bg-orange-500',
    badge: { variant: 'secondary', text: 'Expert Advice' }
  },
]
</script>

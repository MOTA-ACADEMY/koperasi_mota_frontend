# Koperasi Mota Frontend

A modern Vue.js 3 application with TypeScript, Vite, and Shadcn/ui components.

## 🚀 Features

- **Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Vue Router** for client-side routing
- **Tailwind CSS** for styling
- **Shadcn/ui** inspired components
- **Modern development tools**

## 📦 Project Structure

```
src/
├── components/
│   └── ui/           # Shadcn/ui inspired components
│       ├── Button.vue
│       ├── Card.vue
│       └── index.ts
├── views/           # Page components
│   ├── HomeView.vue
│   └── AboutView.vue
├── router/          # Vue Router configuration
│   └── index.ts
├── lib/             # Utility functions
│   └── utils.ts
├── assets/          # Static assets and styles
│   └── main.css
└── main.ts          # Application entry point
```

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Preview production build
npm run preview
```

## 🎨 UI Components

The project includes Shadcn/ui inspired components:

### Button

```vue
<template>
  <Button variant="default" size="lg">Click me</Button>
  <Button variant="outline">Secondary</Button>
</template>
```

### Card

```vue
<template>
  <Card class="p-6">
    <h3>Card Title</h3>
    <p>Card content...</p>
  </Card>
</template>
```

## 🌐 Routes

- `/` - Home page
- `/about` - About page

## 🎯 Backend Integration

This frontend is designed to work with a Go (Golang) backend API. The structure is prepared for:

- RESTful API calls
- Authentication handling
- Data management
- Real-time updates

## 📱 Responsive Design

Built with Tailwind CSS for mobile-first responsive design that works on all devices.

## 🔧 Configuration

### Tailwind CSS

Configured with Shadcn/ui color system and design tokens in `tailwind.config.js`.

### TypeScript

Full TypeScript support with proper type definitions for Vue components.

### Vite

Optimized build configuration with hot module replacement for fast development.

## 🚀 Deployment

Build the project for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 📄 License

[Your License Here]

---

**Happy coding! 🎉**

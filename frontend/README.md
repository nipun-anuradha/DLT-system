# DLT Support System

An enterprise IT support system built with React, Vite, and TailwindCSS.

## Features

- 🔐 Secure authentication system
- 🎨 Modern, glassmorphic UI design
- 🌙 Dark mode support
- 📱 Fully responsive
- ⚡ Fast performance with Vite
- 🎯 Built with React 19 and TailwindCSS 3

## Project Structure

```
dlt-system/
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # Reusable components
│   │   ├── common/      # Common UI components (Button, Input)
│   │   ├── layout/      # Layout components (AuthLayout, etc.)
│   │   └── features/    # Feature-specific components
│   ├── pages/           # Page components
│   │   └── Login.jsx    # Login page
│   ├── services/        # API services
│   │   └── authService.js
│   ├── utils/           # Utilities and helpers
│   │   ├── api.js       # API wrapper
│   │   └── constants.js # App constants
│   ├── hooks/           # Custom React hooks
│   ├── context/         # Context providers
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Public assets
└── ...config files
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dlt-system
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME="DLT Support System"
VITE_COMPANY_NAME="Enterprise Systems Inc."
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS 3** - Utility-first CSS framework
- **Google Fonts** - Spline Sans font family
- **Material Symbols** - Icon library

## Design System

### Colors
- **Primary**: #38e07b (Green)
- **Background Light**: #f6f8f7
- **Background Dark**: #122017
- **Surface Dark**: #1c2e25
- **Input Border**: #3d5245
- **Input Background**: #1c2620

### Typography
- **Font Family**: Spline Sans

### Border Radius
- Default: 1rem
- Large: 1.5rem
- Extra Large: 3rem

## Features Roadmap

- [x] Login interface
- [ ] Dashboard
- [ ] Ticket management
- [ ] User management
- [ ] Reports and analytics
- [ ] Real-time notifications
- [ ] File attachments
- [ ] Search and filters
- [ ] Role-based access control

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

All rights reserved - Enterprise Systems Inc.

## Support

For support, contact IT Support team.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

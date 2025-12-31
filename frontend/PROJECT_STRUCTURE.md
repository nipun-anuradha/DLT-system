# Project Structure

```
dlt-system/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   │   ├── common/      # Common UI components (Button, Input, etc.)
│   │   ├── layout/      # Layout components (Header, Sidebar, etc.)
│   │   └── features/    # Feature-specific components
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Tickets.jsx
│   │   └── ...
│   ├── services/        # API services
│   │   ├── authService.js
│   │   ├── ticketService.js
│   │   └── ...
│   ├── utils/           # Utility functions
│   │   ├── api.js
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React Context providers
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables
├── .env.example         # Environment variables example
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Folder Descriptions

### `/src/components`
- **common/**: Reusable UI components like Button, Input, Card, Modal, etc.
- **layout/**: Layout-related components like Header, Sidebar, Footer, AuthLayout
- **features/**: Feature-specific components organized by feature (tickets, users, reports)

### `/src/pages`
Page-level components that represent different routes in the application.

### `/src/services`
API service files that handle all backend communication.

### `/src/utils`
Utility functions, constants, and helper methods.

### `/src/hooks`
Custom React hooks for shared logic.

### `/src/context`
React Context API providers for global state management.

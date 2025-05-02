# Tugas Besar Pemrograman Web Kelompok A8

## Catering Service E-commerce Platform

### Features

1. **User Features**
   - Modern and responsive user interface
   - Product browsing and filtering by categories
   - User authentication (login/registration)
   - Product modal popups for quick detail viewing
   - Shopping cart functionality
   - Order management and tracking
   - Checkout with multiple payment options
   - User profile management

2. **Admin Features**
   - Dashboard with sales statistics
   - Product management (CRUD operations)
   - Order management
   - User management
   - Category management
   - Analytics and reporting

### Technology Stack

#### Frontend
- React.js with React Router for navigation
- Bootstrap for responsive UI components
- SweetAlert2 for enhanced notifications
- Chart.js for analytics visualization
- Axios for API communication

#### Backend
- Node.js with Express
- MySQL database
- JWT for authentication
- Multer for file uploads

### Key Components

#### Product Display Components
- `ProductList.js`: Displays all products with filtering
- `ProductModal.js`: Shows product details in a popup modal
- `ProductDetail.js`: Full product details page

#### Cart Components
- `CartList.js`: Shopping cart management
- `CartIndicator.js`: Floating cart indicator
- `CartNotification.js`: Notification for cart actions

#### Layout Components
- `Layout.js`: Main layout wrapper with navigation
- `AdminLayout.js`: Admin dashboard layout
- `Footer.js`: Site footer

#### Order Components
- `OrderList.js`: List of user orders
- `OrderDetail.js`: Order details and status

### Recent Updates

1. **Product Modal Enhancement**
   - Implemented responsive modal popups for product details
   - Added quick view functionality from product cards
   - Improved image error handling
   - Added loading indicators

2. **Shopping Cart Improvements**
   - Redesigned cart interface with Bootstrap
   - Added floating cart indicator
   - Implemented toast notifications for cart actions
   - Created streamlined checkout process

3. **UI Enhancements**
   - Added hover effects to product cards
   - Created consistent styling across all components
   - Improved responsive design for mobile devices
   - Enhanced form validations

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   cd ecommerce-frontend
   npm install
   cd ../ecommerce-backend
   npm install
   ```

3. Set up the database:
   ```
   cd ecommerce-backend
   npm run db:setup
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

5. Start the frontend development server:
   ```
   cd ../ecommerce-frontend
   npm run dev
   ```

### Contributors
- [Contributor 1]
- [Contributor 2]
- [Contributor 3]
- [Contributor 4]

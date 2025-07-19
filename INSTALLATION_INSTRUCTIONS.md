# Unick Enterprises Inc. - Order Processing, Inventory & Production Tracking System

## Installation Instructions

### System Overview
This is a comprehensive web-based order processing management system, inventory and production tracking system specifically tailored for Unick Enterprises Inc. The system features:

- **MRP-based Inventory Management System**
- **Real-time Production Tracking System**  
- **Integrated Order Processing Management**
- **Automated Reporting System**
- **Wood-themed UI Design with Unick Enterprises Branding**

---

## Backend Installation (Laravel 10)

### Prerequisites
- PHP 8.1 or higher
- Composer
- SQLite (included with PHP)
- Node.js and npm (for frontend)

### Step 1: Navigate to Backend Directory
```bash
cd back
```

### Step 2: Install PHP Dependencies
```bash
composer install
```

### Step 3: Install Additional Required Packages
The system requires Laravel Excel and DOMPDF for export functionality:
```bash
composer require maatwebsite/excel:^3.1
composer require barryvdh/laravel-dompdf:^2.0
```

### Step 4: Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 5: Configure .env File
Edit the `.env` file with the following configuration:
```env
APP_NAME="Unick Enterprises Management System"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=http://localhost:8000

LOG_CHANNEL=stack

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DRIVER=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@unickenterprises.com
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

# Unick Enterprises Specific Settings
COMPANY_NAME="Unick Enterprises Inc."
COMPANY_ADDRESS="Cabuyao City, Laguna, Philippines"
COMPANY_PHONE="+63-XXX-XXX-XXXX"
COMPANY_EMAIL="info@unickenterprises.com"
```

### Step 6: Database Setup
```bash
# Create SQLite database file
touch database/database.sqlite

# Run migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed
```

### Step 7: Configure Laravel Excel and DOMPDF
Add to `config/app.php` providers array (if not auto-discovered):
```php
'providers' => [
    // Other providers...
    Maatwebsite\Excel\ExcelServiceProvider::class,
    Barryvdh\DomPDF\ServiceProvider::class,
],
```

Add to aliases array:
```php
'aliases' => [
    // Other aliases...
    'Excel' => Maatwebsite\Excel\Facades\Excel::class,
    'PDF' => Barryvdh\DomPDF\Facade\Pdf::class,
],
```

### Step 8: Publish Configuration Files
```bash
# Publish Excel config
php artisan vendor:publish --provider="Maatwebsite\Excel\ExcelServiceProvider" --tag=config

# Publish DOMPDF config
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
```

### Step 9: Set Permissions
```bash
# Set storage permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Set database permissions
chmod 664 database/database.sqlite
```

### Step 10: Start Backend Server
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

---

## Frontend Installation (React)

### Step 1: Navigate to Frontend Directory
```bash
cd ../front
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Install Additional Required Packages
The system requires specific packages for enhanced functionality:
```bash
# Core React packages
npm install axios react-router-dom

# UI Framework and Components
npm install react-bootstrap bootstrap

# Icons and Animation
npm install lucide-react framer-motion

# Charts and Visualization
npm install chart.js react-chartjs-2

# PDF Generation and Canvas
npm install html2canvas jspdf

# Notifications
npm install react-toastify

# Additional utilities
npm install prop-types
```

### Step 4: Environment Configuration
Create `.env` file in the frontend directory:
```env
# React App Configuration
REACT_APP_NAME="Unick Enterprises Management System"
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_COMPANY_NAME="Unick Enterprises Inc."
REACT_APP_COMPANY_TAGLINE="Woodcraft Furniture Excellence"

# Development Settings
GENERATE_SOURCEMAP=false
REACT_APP_ENV=production
```

### Step 5: Start Frontend Development Server
```bash
npm start
```

The application will be available at `http://localhost:3000`

---

## Production Deployment

### Backend Production Setup
```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### Frontend Production Build
```bash
# Build for production
npm run build

# The build folder contains optimized production files
# Deploy the contents to your web server
```

---

## System Features

### 1. Inventory Management System (MRP-based)
- **Real-time stock tracking** with SKU management
- **Automated reorder point calculations** based on daily usage
- **Predictive analytics** for material usage forecasting
- **Lead time management** and safety stock calculations
- **Excel export** functionality for inventory reports

### 2. Production Tracking System
- **Real-time production monitoring** with status tracking
- **Production stages**: Material Prep → Cutting → Assembly → Finishing → Quality Control → Packaging
- **Efficiency calculations** and performance analytics
- **Resource utilization tracking** (workers and machines)
- **Quality score management** and production reporting

### 3. Order Processing Management
- **Customer order placement** with real-time tracking
- **Order status management**: Pending → Confirmed → In Production → Quality Check → Ready for Shipping → Shipped → Delivered
- **Priority level management** (Low, Normal, High, Urgent)
- **Automated tracking number generation**
- **Estimated delivery date calculations**

### 4. Reporting and Analytics
- **PDF report generation** with company branding
- **Excel exports** for all major data sets
- **Dashboard analytics** with charts and KPIs
- **Production efficiency metrics**
- **Inventory forecasting** with 30-day projections

### 5. User Management
- **Role-based access control** (Admin/Employee vs Customer)
- **Secure authentication** with Laravel Sanctum
- **User-specific dashboards** and functionality

---

## Default User Accounts

After seeding the database, you can use these accounts:

### Admin Account
- **Email**: admin@unickenterprises.com
- **Password**: admin123
- **Role**: Employee (Admin access)

### Customer Account  
- **Email**: customer@example.com
- **Password**: customer123
- **Role**: Customer

---

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Inventory Management (MRP)
- `GET /api/inventory` - List all inventory items
- `POST /api/inventory` - Create inventory item
- `GET /api/inventory/forecast` - Get MRP forecasting data
- `GET /api/inventory/export` - Export inventory to Excel
- `GET /api/inventory/reorder-alerts` - Get items needing reorder

### Production Tracking
- `GET /api/productions` - List production records
- `POST /api/productions` - Create production record
- `GET /api/productions/dashboard` - Production analytics
- `GET /api/productions/export` - Export production data
- `GET /api/productions/analytics` - Detailed production analytics

### Order Processing
- `GET /api/orders` - List all orders (admin)
- `POST /api/orders` - Create new order
- `GET /api/orders/analytics` - Order analytics
- `GET /api/orders/export` - Export orders to Excel
- `GET /api/track/{trackingNumber}` - Public order tracking

---

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Ensure SQLite file exists and has correct permissions
   touch database/database.sqlite
   chmod 664 database/database.sqlite
   ```

2. **Composer Dependencies Error**
   ```bash
   # Clear composer cache and reinstall
   composer clear-cache
   composer install --no-cache
   ```

3. **Frontend Build Errors**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Permission Errors**
   ```bash
   # Fix Laravel permissions
   sudo chown -R $USER:www-data storage
   sudo chown -R $USER:www-data bootstrap/cache
   chmod -R 775 storage
   chmod -R 775 bootstrap/cache
   ```

5. **Excel/PDF Export Issues**
   ```bash
   # Ensure export classes are properly autoloaded
   composer dump-autoload
   php artisan config:clear
   ```

---

## System Requirements

### Minimum Requirements
- **PHP**: 8.1+
- **Memory**: 512MB RAM
- **Storage**: 1GB free space
- **Node.js**: 16.0+
- **Browser**: Modern browser with JavaScript enabled

### Recommended Requirements
- **PHP**: 8.2+
- **Memory**: 2GB RAM
- **Storage**: 5GB free space
- **Node.js**: 18.0+
- **Database**: SQLite 3.8+ (included with PHP)

---

## Support and Documentation

For technical support or questions about the Unick Enterprises Management System:

- **System Documentation**: Available in the `/docs` directory
- **API Documentation**: Available at `/api/documentation` when server is running
- **Issue Reporting**: Contact your system administrator
- **Feature Requests**: Submit through the admin panel

---

## Security Notes

1. **Change default passwords** immediately after installation
2. **Configure HTTPS** for production deployment  
3. **Regular database backups** are recommended
4. **Keep dependencies updated** for security patches
5. **Monitor system logs** for unusual activity

---

## License

This system is proprietary software developed specifically for Unick Enterprises Inc. Unauthorized distribution or modification is prohibited.

**© 2024 Unick Enterprises Inc. All rights reserved.**
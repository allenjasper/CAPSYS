# CAPSYS - Customer and Production System

A comprehensive Customer and Production management system for **Unick Furniture** built with Laravel (backend) and React (frontend).

## 🏗️ System Architecture

- **Frontend**: React.js with Bootstrap, Chart.js, and modern UI components
- **Backend**: Laravel 10 with Sanctum authentication
- **Database**: MySQL/SQLite
- **Authentication**: JWT token-based with role management

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.1
- **Composer** (PHP dependency manager)
- **Node.js** >= 16.x and **npm**
- **MySQL** or **SQLite** (for database)
- **Git**

### 🛠️ Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd capsys
   ```

2. **Backend Setup (Laravel)**
   ```bash
   cd back
   
   # Install PHP dependencies
   composer install
   
   # Copy environment file (create one if it doesn't exist)
   cp .env.example .env  # or create .env manually
   
   # Generate application key
   php artisan key:generate
   
   # Configure your database in .env file
   # For SQLite (easier setup):
   # DB_CONNECTION=sqlite
   # DB_DATABASE=/absolute/path/to/database.sqlite
   
   # For MySQL:
   # DB_CONNECTION=mysql
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   # DB_DATABASE=capsys
   # DB_USERNAME=your_username
   # DB_PASSWORD=your_password
   
   # Run database migrations
   php artisan migrate
   
   # Seed the database (optional - adds sample data)
   php artisan db:seed
   
   cd ..
   ```

3. **Frontend Setup (React)**
   ```bash
   cd front
   
   # Install Node.js dependencies
   npm install
   
   cd ..
   ```

### 🚀 Running the Application

**Option 1: Using the automated startup script (Recommended)**
```bash
./start_system.sh
```

**Option 2: Manual startup**
```bash
# Terminal 1 - Backend
cd back
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 - Frontend
cd front
npm start
```

### 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/documentation (if available)

### 👥 Default Test Accounts

After seeding the database, you can use these accounts:

- **Customer Account**
  - Email: `customer@gmail.com`
  - Password: `customer`

- **Employee/Admin Account**
  - Email: `admin@gmail.com`
  - Password: `admin`

## 📁 Project Structure

```
capsys/
├── back/                 # Laravel Backend
│   ├── app/             # Application logic
│   ├── config/          # Configuration files
│   ├── database/        # Migrations and seeders
│   ├── routes/          # API routes
│   └── composer.json    # PHP dependencies
├── front/               # React Frontend
│   ├── src/            # React source code
│   ├── public/         # Static assets
│   └── package.json    # Node.js dependencies
├── start_system.sh     # Automated startup script
└── SYSTEM_STATUS.md    # Current development status
```

## ⚙️ Environment Configuration

### Backend (.env configuration)

Create a `.env` file in the `back/` directory with these key settings:

```env
APP_NAME=CAPSYS
APP_ENV=local
APP_KEY=base64:your-generated-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/your/database.sqlite

# For MySQL instead of SQLite:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=capsys
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change ports in the startup script or run manually with different ports
   - Kill existing processes: `pkill -f "php artisan serve"` or `pkill -f "npm start"`

2. **Database connection errors**
   - Verify your `.env` database configuration
   - Ensure your database server is running
   - For SQLite, ensure the database file exists and has proper permissions

3. **Composer/npm installation fails**
   - Clear cache: `composer clear-cache` or `npm cache clean --force`
   - Try deleting `vendor/` or `node_modules/` and reinstalling

4. **CORS issues**
   - Verify SANCTUM_STATEFUL_DOMAINS in backend `.env`
   - Check that frontend is running on the expected port (3000)

5. **Permission issues**
   - Make sure the startup script is executable: `chmod +x start_system.sh`
   - For Laravel, ensure storage and cache directories are writable

### Development Tools

- **Backend logs**: `tail -f back/storage/logs/laravel.log`
- **Clear Laravel cache**: `cd back && php artisan cache:clear`
- **Reset database**: `cd back && php artisan migrate:fresh --seed`

## 📖 Features

- **Customer Management**: Registration, authentication, profile management
- **Product Catalog**: Browse products, view details, stock management
- **Shopping Cart**: Add/remove items, quantity management
- **Order System**: Checkout process, order tracking
- **Admin Dashboard**: Product management, order oversight
- **Role-based Access**: Different permissions for customers and employees
- **Real-time Updates**: Live notifications and data synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 System Requirements

- **Minimum**: PHP 8.1, Node.js 16, 2GB RAM
- **Recommended**: PHP 8.2+, Node.js 18+, 4GB RAM, SSD storage

## 📞 Support

If you encounter any issues during setup or have questions about the system, please check the `SYSTEM_STATUS.md` file for current development status and known issues.

---

**Happy coding! 🚀**
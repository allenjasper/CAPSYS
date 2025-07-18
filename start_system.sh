#!/bin/bash

echo "🚀 Starting CAPSYS - Customer and Production System"
echo "=================================================="

# Check if we're in the right directory
if [ ! -d "front" ] || [ ! -d "back" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Starting Laravel Backend Server..."
cd back
php artisan serve --host=0.0.0.0 --port=8000 &
BACKEND_PID=$!
cd ..

echo "⚛️  Starting React Frontend Server..."
cd front
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ CAPSYS System Started Successfully!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000"
echo ""
echo "📋 Default Test Accounts:"
echo "   Customer: customer@gmail.com / customer"
echo "   Employee: admin@gmail.com / admin"
echo ""
echo "⚡ Both servers are running in the background"
echo "🛑 Press Ctrl+C to stop both servers"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping CAPSYS servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped successfully"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for user to press Ctrl+C
echo "💡 Tip: Open http://localhost:3000 in your browser to access the system"
while true; do
    sleep 1
done
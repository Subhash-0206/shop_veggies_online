# VeggieShop - Run All Services
# This script starts all backend microservices and the frontend in separate windows.

Write-Host "🚀 Starting VeggieShop Platform..." -ForegroundColor Green

# 1. Start Eureka Server (Port 8761)
Write-Host "Starting Eureka Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd eureka-server; mvn spring-boot:run" -WindowStyle Normal
Start-Sleep -Seconds 15

# 2. Start API Gateway (Port 8080)
Write-Host "Starting API Gateway..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api-gateway; mvn spring-boot:run" -WindowStyle Normal

# 3. Start Core Services
Write-Host "Starting Microservices..."
$services = @("user-service", "product-service", "cart-service", "order-service", "payment-service")
foreach ($service in $services) {
    Write-Host "-> Starting $service..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $service; mvn spring-boot:run" -WindowStyle Normal
}

# 4. Start Frontend (Port 5173)
Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "✅ All services are starting! Please wait a minute for everything to initialize." -ForegroundColor Green
Write-Host "Check Eureka at: http://localhost:8761"
Write-Host "Open Web App at: http://localhost:5173"

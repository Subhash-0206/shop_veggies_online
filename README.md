# VeggieShop - Microservices Platform

Premium Vegetable Online Shopping platform with a highly scalable microservice architecture.

## Tech Stack
- **Backend:** Java 17, Spring Boot 3, Spring Cloud Gateway, Eureka.
- **Database:** PostgreSQL (Supabase).
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion.
- **Messaging:** REST APIs (Service Discovery via Eureka).

## Database Configuration
All services connect to common Supabase DB:
- **Project URL:** https://yzquiklehhohpdnhyxic.supabase.co
- **Database Name:** `shop_veggies_online`

## Setup Instructions
1. **Clone Research**: Download/Open the project.
2. **Build Backends**: Run `./mvnw clean install` in each service directory.
3. **Start Core**: Run `eureka-server` and `api-gateway` projects.
4. **Start Business Services**: Run `user-service`, `product-service`, `cart-service`, `order-service`, and `payment-service`.
5. **Start Frontend**: Run `npm install` and `npm run dev` in the `frontend` directory.

## Admin Features
Register as an Admin to access:
- Inventory Management (Add/Edit vegetables)
- Global Order Management
- Customer Insights

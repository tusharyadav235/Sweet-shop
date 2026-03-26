# 🪷 Jiya Lal Halwai – Full Stack Sweet Store

A complete e-commerce website for an Indian sweet store with:
- **Frontend**: HTML + CSS + JavaScript (Nginx)
- **Backend**: Java 17 + Spring Boot 3.2
- **Database**: MySQL 8.0
- **Deployment**: Docker + Docker Compose (ready for AWS EC2)

---

## 🗂️ Project Structure

```
jiya-lal-halwai/
├── frontend/                  # HTML/CSS/JS frontend
│   ├── index.html             # Main store page
│   ├── login.html             # Login/Register
│   ├── admin/index.html       # Admin panel
│   ├── css/style.css          # Styles
│   ├── js/
│   │   ├── api.js             # API helper
│   │   └── app.js             # App logic + cart
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                   # Spring Boot API
│   ├── src/main/java/com/jiyalal/halwai/
│   │   ├── HalwaiApplication.java
│   │   ├── config/            # Security, JWT, CORS
│   │   ├── controller/        # REST Controllers
│   │   ├── model/             # JPA Entities
│   │   └── repository/        # Spring Data repos
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── Dockerfile
├── mysql-init/
│   └── init.sql
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔑 Default Credentials

| Role  | Email                       | Password   |
|-------|-----------------------------|------------|
| Admin | admin@jiyalalhalwai.com     | admin123   |

> ⚠️ Change these immediately after first login!

---

## 🚀 Quick Deploy on EC2

### 1. Connect to your EC2 instance
```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
```

### 2. Install Docker & Docker Compose
```bash
# Amazon Linux 2 / AL2023
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Re-login for group changes
exit && ssh -i your-key.pem ec2-user@YOUR_EC2_IP
```

### 3. Upload project to EC2
```bash
# From your local machine:
scp -i your-key.pem -r jiya-lal-halwai/ ec2-user@YOUR_EC2_IP:~/
```

### 4. Configure environment
```bash
cd ~/jiya-lal-halwai
cp .env.example .env
nano .env   # Update passwords and JWT secret
```

### 5. Open EC2 Security Group ports
In AWS Console → EC2 → Security Groups, add inbound rules:
- **HTTP** (port 80) from 0.0.0.0/0
- **HTTPS** (port 443) from 0.0.0.0/0
- **Custom TCP** (port 8080) from 0.0.0.0/0 (optional, for direct API access)

### 6. Deploy!
```bash
cd ~/jiya-lal-halwai
docker-compose up --build -d
```

### 7. Check status
```bash
docker-compose ps
docker-compose logs -f backend   # View backend logs
docker-compose logs -f frontend  # View frontend logs
```

### 8. Access your store
- **Store**: `http://YOUR_EC2_IP`
- **Admin**: `http://YOUR_EC2_IP/admin/`
- **API**: `http://YOUR_EC2_IP/api/products`

---

## 📡 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | All products |
| GET | `/api/products?category=Mithai` | By category |
| GET | `/api/products/{id}` | Single product |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/orders` | Place order |

### Admin (requires JWT token with ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/products` | Add product (multipart) |
| POST | `/api/admin/products/{id}` | Update product |
| DELETE | `/api/admin/products/{id}` | Delete product |
| GET | `/api/admin/orders` | All orders |
| PUT | `/api/admin/orders/{id}/status` | Update order status |
| GET | `/api/admin/users` | All customers |

---

## 💳 Payment Integration

The store includes a payment UI with 3 modes:
- **UPI** – Enter UPI ID
- **Card** – Enter card details
- **COD** – Cash on Delivery

### To integrate real payment (Razorpay recommended for India):
1. Sign up at [razorpay.com](https://razorpay.com)
2. Get API Key & Secret
3. Add Razorpay script to `frontend/index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```
4. In `app.js`, replace `placeOrder()` with Razorpay checkout:
```javascript
const rzp = new Razorpay({
  key: 'YOUR_RAZORPAY_KEY',
  amount: total * 100, // in paise
  currency: 'INR',
  name: 'Jiya Lal Halwai',
  handler: function(response) {
    // Call backend to verify and create order
  }
});
rzp.open();
```
5. Add Razorpay dependency to `pom.xml` and create a `/api/payment/create-order` endpoint

---

## 🔧 Development (Local)

### Backend only
```bash
cd backend
# Start MySQL locally or with Docker:
docker run -d -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=jiyalal_db -p 3306:3306 mysql:8.0

# Run Spring Boot
./mvnw spring-boot:run
```

### Frontend only
```bash
# Simply open frontend/index.html in browser
# Or use Live Server in VS Code
```

---

## 🛠️ Common Commands

```bash
# Stop all
docker-compose down

# Stop and delete data
docker-compose down -v

# Rebuild specific service
docker-compose up --build backend -d

# View logs
docker-compose logs -f

# Access MySQL
docker exec -it jiyalal-mysql mysql -u jiyalal -psweetpassword123 jiyalal_db

# Backup database
docker exec jiyalal-mysql mysqldump -u root -prootpassword123 jiyalal_db > backup.sql
```

---

## 🌐 HTTPS Setup (Optional but recommended)

```bash
# Install Certbot
sudo yum install certbot -y

# Get SSL cert (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf to use HTTPS
# Add SSL cert paths and redirect HTTP → HTTPS
```

---

## 🎁 Features

- ✅ Product catalog with categories
- ✅ Image upload for products
- ✅ Shopping cart (localStorage)
- ✅ Guest checkout
- ✅ UPI / Card / COD payment UI
- ✅ Order tracking
- ✅ JWT Authentication
- ✅ Admin panel (add/edit/delete products, manage orders)
- ✅ Customer management
- ✅ Responsive design (mobile-friendly)
- ✅ Docker + Docker Compose
- ✅ MySQL with JPA auto-schema
- ✅ Sample data seeded on first run

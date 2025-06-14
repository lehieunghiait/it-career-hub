# Career IT Hub - Job Portal for IT Professionals

Career IT Hub is a modern job portal dedicated to connecting IT professionals with top companies in the technology sector. Built with React, TypeScript, and Ant Design, this platform offers a seamless experience for both job seekers and employers.

## ✨ Features

### For Job Seekers

- **Job Search**: Search for IT jobs based on skills, location, and salary
- **Company Profiles**: Explore detailed information about potential employers
- **Apply Online**: Submit applications directly through the platform
- **Profile Management**: Create and maintain a professional profile to showcase skills

### For Employers

- **Job Posting**: Create and publish job listings
- **Candidate Management**: Efficiently screen and manage applicants
- **Company Profile**: Showcase your company culture and benefits
- **Analytics**: Track job posting performance and application metrics

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Library**: Ant Design
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styles**: SCSS Modules
- **Form Handling**: Ant Design Forms
- **Rich Text Editor**: React Quill
- **Linting**: ESLint, Prettier

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16.x or higher)
- npm (v8.x or higher) or Yarn (v1.22.x or higher)

## 🚀 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/lehieunghia02/it-career-hub.git
   cd it-career-hub
   ```

2. Install dependencies:

   ```bash
   npm install
   # or with yarn
   yarn install
   ```

3. Set up environment variables:

   - Create a `.env` file in the root directory
   - Add the required environment variables (see `.env.example` if available)

4. Start the development server:

   ```bash
   npm run dev
   # or with yarn
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 🐳 Docker

### Hướng dẫn đóng gói và chạy thử với Docker

1. **Đóng gói ứng dụng với Docker**

   Tạo Docker image:

   ```bash
   # Tại thư mục gốc của dự án
   docker build -t it-career-hub:latest .
   ```

   Kiểm tra image đã được tạo:

   ```bash
   docker images
   ```

2. **Chạy thử ứng dụng**

   Chạy container từ image:

   ```bash
   docker run -d -p 8080:80 --name it-career-hub-container it-career-hub:latest
   ```

   Các tham số:

   - `-d`: Chạy container ở chế độ nền (detached)
   - `-p 8080:80`: Ánh xạ cổng 8080 trên máy chủ tới cổng 80 trong container
   - `--name it-career-hub-container`: Đặt tên cho container
   - `it-career-hub:latest`: Tên image để chạy

3. **Kiểm tra container đang chạy**

   ```bash
   docker ps
   ```

4. **Truy cập ứng dụng**

   Mở trình duyệt và truy cập: `http://localhost:8080`

5. **Dừng và xóa container**

   ```bash
   # Dừng container
   docker stop it-career-hub-container

   # Xóa container
   docker rm it-career-hub-container
   ```

### Chạy với Docker Compose

1. **Chạy ứng dụng trong môi trường phát triển (với hot reload)**:

   ```bash
   # Tại thư mục gốc của dự án
   docker-compose up dev
   ```

   Ứng dụng sẽ chạy ở chế độ phát triển và có thể truy cập tại `http://localhost:5173`

2. **Chạy ứng dụng đã build với Nginx**:

   ```bash
   docker-compose up app
   ```

   Ứng dụng sẽ được build và chạy trên Nginx, có thể truy cập tại `http://localhost:8080`

3. **Build và chạy trong chế độ nền**:

   ```bash
   docker-compose up -d app
   ```

4. **Kiểm tra container đang chạy**:

   ```bash
   docker-compose ps
   ```

5. **Xem logs của container**:

   ```bash
   # Xem logs của dịch vụ dev
   docker-compose logs dev

   # Xem logs của dịch vụ app
   docker-compose logs app

   # Theo dõi logs (follow)
   docker-compose logs -f app
   ```

6. **Dừng và xóa container**:

   ```bash
   # Dừng tất cả container
   docker-compose down

   # Dừng và xóa volumes (cẩn thận khi sử dụng)
   docker-compose down -v
   ```

7. **Rebuild image khi có thay đổi**:

   ```bash
   docker-compose build app
   docker-compose up app
   ```

## 🔄 CI/CD với GitHub Actions

Dự án này sử dụng GitHub Actions để tự động triển khai lên Vercel khi có thay đổi được push lên nhánh main/master.

### Thiết lập Vercel Deployment

1. Tạo tài khoản trên [Vercel](https://vercel.com)
2. Liên kết repository GitHub với Vercel
3. Lấy các token và ID cần thiết:
   - Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
   - Đi tới Settings → Tokens → Tạo token mới
   - Lưu token này làm `VERCEL_TOKEN`
   - Đi tới Project Settings → General → Lấy "Project ID" làm `VERCEL_PROJECT_ID`
   - Đi tới [Account Settings](https://vercel.com/account) → Lấy "User ID" hoặc "Team ID" làm `VERCEL_ORG_ID`
4. Thêm secrets vào GitHub repository:
   - Đi tới repository GitHub → Settings → Secrets and variables → Actions
   - Thêm ba biến môi trường sau:
     - `VERCEL_TOKEN`: Token API từ Vercel
     - `VERCEL_ORG_ID`: ID tổ chức Vercel
     - `VERCEL_PROJECT_ID`: ID dự án Vercel

![Thêm GitHub Secrets](https://i.imgur.com/8tZcLTh.png)

### Workflow

- Push lên nhánh main/master sẽ kích hoạt triển khai tự động
- Pull request sẽ tạo ra bản preview trước khi merge

## 📁 Project Structure

```
/src
  /assets        # Static assets like images, fonts
  /components    # Reusable UI components
    /admin       # Admin-specific components
    /client      # Client-facing components
    /share       # Shared components
  /config        # Configuration files and API setup
  /pages         # Page components
    /admin       # Admin pages
    /auth        # Authentication pages
    /company     # Company pages
    /home        # Home page
    /job         # Job-related pages
    /about       # About page
    /faq         # FAQ page
  /redux         # Redux store and slices
  /styles        # Global styles and modules
  /types         # TypeScript type definitions
  main.tsx       # Application entry point
  App.tsx        # Main application component with routing
```

## 📜 Available Scripts

- `npm run dev` or `npm start` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code quality issues
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier

## 🌐 Deployment

To deploy the application to production:

1. Build the project:

   ```bash
   npm run build
   ```

2. The build artifacts will be stored in the `dist/` directory

3. Deploy the contents of the `dist/` directory to your web server or hosting service

## 🎯 Features

### Client Side

- Home page with featured jobs and companies
- Job listings with search and filter functionality
- Company profiles and details
- Job application process
- About page with company information
- FAQ page with common questions and answers

### Admin Side

- Dashboard with analytics
- Job management (create, update, delete)
- Company management
- User management
- Resume management
- Role and permission management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

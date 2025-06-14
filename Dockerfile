# Sử dụng Node.js làm base image
FROM node:18-alpine AS build

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Sao chép source code
COPY . .

# Build ứng dụng
RUN npm run build

# Stage 2: Sử dụng Nginx để phục vụ ứng dụng
FROM nginx:alpine

# Sao chép kết quả build từ stage trước
COPY --from=build /app/dist /usr/share/nginx/html

# Sao chép cấu hình Nginx tùy chỉnh (nếu cần)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80
EXPOSE 80

# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"] 
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
   git clone https://github.com/lehieunghia02/it-career-hub-client.git
   cd it-career-hub-client
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

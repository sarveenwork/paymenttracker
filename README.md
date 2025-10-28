# Payment Tracking System

A complete, production-ready **Payment Tracking System** built with **Next.js 14 (App Router)** + **Tailwind CSS** + **Framer Motion** for frontend, and **Supabase (PostgreSQL + Auth)** for backend.

## 🧩 Project Overview

A web application for managing student payments and tracking their martial arts progression. Admins can log in to update monthly payments, remarks, renewal payments, and student grades. Users can search by name or TM Number to view their payment status and current grade.

## ⚙️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18+, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **Form Handling**: react-hook-form with Zod validation
- **Date Handling**: date-fns
- **HTTP Client**: axios
- **Notifications**: react-hot-toast
- **Icons**: lucide-react
- **Styling**: clsx for conditional classes
- **Language**: TypeScript

## 🗃️ Database Schema

### Tables

#### `grades`

| Column      | Type        | Description                                                   |
| ----------- | ----------- | ------------------------------------------------------------- |
| id          | serial (PK) | primary key                                                   |
| grade_name  | text        | e.g. "White", "Yellow", "Green 2", "1st Dan"                  |
| grade_level | integer     | order from 9 down to 1 for kyu grades, and 1–9 for Dan levels |
| created_at  | timestamp   | default now()                                                 |

#### `students`

| Column           | Type      | Description         |
| ---------------- | --------- | ------------------- |
| id               | uuid (PK) | primary key         |
| student_id       | text      | unique student ID   |
| tm_number        | text      | TM Number (varchar) |
| name             | text      | full name           |
| current_grade_id | int       | FK → grades.id      |
| remarks          | text      | notes (nullable)    |
| created_at       | timestamp | default now()       |
| updated_at       | timestamp | default now()       |

#### `payment_records`

| Column          | Type      | Description      |
| --------------- | --------- | ---------------- |
| id              | uuid (PK) | primary key      |
| student_id      | uuid      | FK → students.id |
| year            | integer   | e.g., 2025       |
| month           | integer   | 1–12             |
| payment_date    | date      | nullable         |
| renewal_payment | date      | nullable         |
| created_at      | timestamp | default now()    |
| updated_at      | timestamp | default now()    |

#### `admins`

| Column        | Type      | Description            |
| ------------- | --------- | ---------------------- |
| id            | uuid (PK) | primary key            |
| email         | text      | unique                 |
| password_hash | text      | bcrypt hashed password |
| name          | text      | admin display name     |
| created_at    | timestamp | default now()          |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rts
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new Supabase project
   - Go to Settings > API to get your project URL and anon key
   - Go to Settings > Database to get your service role key

4. **Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

5. **Database Setup**

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `supabase-schema.sql` to create tables and seed data

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Features

### Public Search (`/search`)

- Search students by name or TM Number
- View student information, current grade, and payment history
- Responsive design with mobile-friendly cards
- Expandable yearly payment panels
- Monthly payment status indicators (✅ paid, ❌ unpaid)

### Admin Dashboard (`/admin/dashboard`)

- **Authentication**: Secure login with Supabase Auth
- **Student Management**: Add, edit, delete students
- **Grade Management**: Assign martial arts grades to students
- **Payment Tracking**: Monthly payment status management
- **Renewal Payments**: Track renewal payment dates
- **Export Functionality**: Export student data to CSV
- **Search & Filter**: Find students by name, TM Number, or year
- **Responsive Design**: Works on desktop and mobile devices

### Admin Login (`/admin/login`)

- Secure authentication form
- Form validation with error handling
- Demo credentials provided for testing

## 🔐 Authentication

The system uses Supabase Auth for secure admin authentication. The default admin credentials are:

- **Username**: admin
- **Password**: RajenTehLeenVeen

## 📡 API Routes

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/students` - Fetch students (with search and year filters)
- `POST /api/students` - Create new student
- `GET /api/students/[id]` - Get student by ID
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student
- `GET /api/grades` - Fetch all grades
- `POST /api/payments` - Create/update payment record
- `PUT /api/payments` - Update payment record
- `GET /api/search` - Public student search
- `GET /api/export` - Export students to CSV

## 🎨 UI Components

### Core Components

- `GradeBadge` - Displays martial arts grades with color coding
- `StudentTable` - Responsive table for student data
- `StudentEditModal` - Modal for editing student information
- `AddStudentModal` - Modal for adding new students
- `PaymentStatus` - Component for displaying payment history

### Design Features

- **Responsive Layout**: Mobile-first design with Tailwind CSS
- **Animations**: Smooth transitions with Framer Motion
- **Color-coded Grades**: Visual grade indicators with appropriate colors
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Professional Styling**: Clean, modern interface

## 🔒 Security Features

- Supabase Auth for secure authentication
- Route protection middleware for admin areas
- Server-side validation for all API endpoints
- Password hashing with bcrypt
- HTTPS cookies for session management
- Input sanitization and validation

## 📦 Project Structure

```
rts/
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   └── login/
│   ├── api/
│   │   ├── auth/
│   │   ├── students/
│   │   ├── payments/
│   │   ├── grades/
│   │   ├── search/
│   │   └── export/
│   ├── search/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── GradeBadge.tsx
│   ├── StudentTable.tsx
│   ├── StudentEditModal.tsx
│   ├── AddStudentModal.tsx
│   └── PaymentStatus.tsx
├── lib/
│   ├── supabase.ts
│   ├── supabase-server.ts
│   ├── types.ts
│   └── utils.ts
├── middleware.ts
├── supabase-schema.sql
└── package.json
```

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Update Supabase Settings**
   - Add your Vercel domain to Supabase allowed origins
   - Update redirect URLs in Supabase Auth settings

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create Supabase project & copy env keys
- [ ] Run SQL seed for grades + admin
- [ ] Test admin login with default credentials
- [ ] Add student and assign grade
- [ ] Update monthly payments
- [ ] Test public search functionality
- [ ] Test responsive design on mobile
- [ ] Test export functionality
- [ ] Deploy to Vercel

### Test Scenarios

1. **Admin Login**

   - Login with correct credentials
   - Login with incorrect credentials
   - Logout functionality

2. **Student Management**

   - Add new student
   - Edit student information
   - Delete student
   - Assign grades

3. **Payment Tracking**

   - Mark monthly payments as paid
   - Update renewal payment dates
   - View payment history

4. **Public Search**
   - Search by student name
   - Search by TM Number
   - View payment status

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables**

   - Ensure all Supabase keys are correctly set
   - Check that `.env.local` is in the root directory

2. **Database Connection**

   - Verify Supabase project is active
   - Check if SQL schema has been executed
   - Ensure RLS policies are configured

3. **Authentication Issues**

   - Check Supabase Auth settings
   - Verify redirect URLs are configured
   - Ensure admin user exists in database

4. **Build Errors**
   - Clear `.next` folder and rebuild
   - Check for TypeScript errors
   - Verify all dependencies are installed

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ using Next.js 14, Tailwind CSS, Framer Motion, and Supabase**
# paymenttracker

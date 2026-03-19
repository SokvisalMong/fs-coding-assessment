# Frontend Assessment – To-Do Application with Next.js

## 📌 Overview

This assessment evaluates your **frontend engineering skills**. You'll build a production-ready todo application with authentication, advanced state management, optimistic updates, comprehensive error handling, and testing.

**Key Focus Areas**:

- Next.js App Router with server & client components
- Authentication flow and protected routes
- Global state management (Context API)
- Optimistic UI updates and error handling
- Form validation and user feedback
- Performance optimization and accessibility
- Responsive design with Tailwind CSS

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v22 or later)
- Backend API running on `http://localhost:8000`

### Install dependencies

```bash
npm install
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Start dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## ✅ Required Tasks

### Task 1: Authentication System

**Pages**: `/login`, `/register`

Implement complete authentication:

- [x] Registration page with form validation
  - Username and password validation (allowed characters and length)
  - Display validation errors
- [x] Login page
  - Username and password fields
  - Error handling for invalid credentials
- [x] JWT token management
  - Store tokens securely (httpOnly cookies or localStorage with XSS protection)
  - Handle token expiration gracefully
- [x] Protected routes
  - Redirect to login if not authenticated
  - Middleware or HOC for route protection
- [x] User profile display
  - Show logged-in user info in header
  - Logout functionality (clear token in frontend)

### Task 2: Todo Management

Build comprehensive todo interface:

#### List View

- [x] Display all todos and paginated (20 per page)
- [x] Filtering by:
  - Priority (HIGH, MEDIUM, LOW)
- [x] Search by title functionality (debounced, min 2 chars)
- [x] Empty states with helpful messages
- [x] Spinner during fetch
- [x] Infinite scroll or pagination controls

#### Todo Item Features

- [x] View todo details (only owner)
- [x] Quick complete/uncomplete toggle (only owner)
- [x] Editing capability (only owner)
- [x] Delete with confirmation modal (only owner)
- [x] Visual indicators for:
  - Priority level (colors/badges)

#### Create/Edit Forms

- [x] Modal or slide-over for todo creation
- [x] Form fields:
  - Title (required, max 200 chars)
  - Description (textarea)
  - Priority selector
- [x] Real-time validation
- [x] Cancel and save actions
- [x] Form dirty state handling (warn before leaving)

### Task 3: Optimistic Updates & Error Handling

Implement production-ready UX patterns:

#### Optimistic Updates

- [x] Immediately update UI when user takes action
- [x] Show pending state (e.g., opacity, spinner)

#### Error Handling

- [x] Error boundaries for React errors
- [x] API error handling with retry logic
- [x] Toast notifications for success/error
- [x] Form validation errors displayed inline

### Task 4: Accessibility & UX

- [x] Semantic HTML throughout
- [x] ARIA labels and roles
- [x] Keyboard navigation support (Tab, Enter, Escape)
- [x] Screen reader friendly

### Task 5: Responsive Design

Using Tailwind CSS:

- [x] Mobile-first approach
- [x] Adaptive layouts (grid/flex)
- [x] Work on multiple device sizes

---

## ✅ Submission Checklist

Before submitting:

- [ ] All features implemented and working
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessible (keyboard navigation, screen reader)
- [ ] README updated with setup instructions
- [ ] `.env.example` included
- [ ] Code is well-documented and formatted

---

**Good luck!** Build something you'd be proud to show in a production environment. 🚀

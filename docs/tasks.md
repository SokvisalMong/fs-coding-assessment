# Tasks

## Frontend
### Task 1: Authentication System

**Pages**: `/login`, `/register`

Implement complete authentication:

- [ ] Registration page with form validation
  - Username and password validation (allowed characters and length)
  - Display validation errors
- [ ] Login page
  - Username and password fields
  - Error handling for invalid credentials
- [ ] JWT token management
  - Store tokens securely (httpOnly cookies or localStorage with XSS protection)
  - Handle token expiration gracefully
- [ ] Protected routes
  - Redirect to login if not authenticated
  - Middleware or HOC for route protection
- [ ] User profile display
  - Show logged-in user info in header
  - Logout functionality (clear token in frontend)

### Task 2: Todo Management

Build comprehensive todo interface:

#### List View

- [ ] Display all todos and paginated (20 per page)
- [ ] Filtering by:
  - Priority (HIGH, MEDIUM, LOW)
- [ ] Search by title functionality (debounced, min 2 chars)
- [ ] Empty states with helpful messages
- [ ] Spinner during fetch
- [ ] Infinite scroll or pagination controls

#### Todo Item Features

- [ ] View todo details (only owner)
- [ ] Quick complete/uncomplete toggle (only owner)
- [ ] Editing capability (only owner)
- [ ] Delete with confirmation modal (only owner)
- [ ] Visual indicators for:
  - Priority level (colors/badges)

#### Create/Edit Forms

- [ ] Modal or slide-over for todo creation
- [ ] Form fields:
  - Title (required, max 200 chars)
  - Description (textarea)
  - Priority selector
- [ ] Real-time validation
- [ ] Cancel and save actions
- [ ] Form dirty state handling (warn before leaving)

### Task 3: Optimistic Updates & Error Handling

Implement production-ready UX patterns:

#### Optimistic Updates

- [ ] Immediately update UI when user takes action
- [ ] Show pending state (e.g., opacity, spinner)

#### Error Handling

- [ ] Error boundaries for React errors
- [ ] API error handling with retry logic
- [ ] Toast notifications for success/error
- [ ] Form validation errors displayed inline

### Task 4: Accessibility & UX

- [ ] Semantic HTML throughout
- [ ] ARIA labels and roles
- [ ] Keyboard navigation support (Tab, Enter, Escape)
- [ ] Screen reader friendly

### Task 5: Responsive Design

Using Tailwind CSS:

- [ ] Mobile-first approach
- [ ] Adaptive layouts (grid/flex)
- [ ] Work on multiple device sizes

## Backend

### Task 1: Database Relationship - Connect Todo and User Tables

### Task 2: Implement Todo CRUD API Endpoints

Implement complete CRUD operations for todos. All endpoints require authentication (Bearer token).

#### POST /api/v1/todos

Create a new todo:

- Accept: `title`, `description`, `priority` (optional), `due_date` (optional)
- Auto-assign to authenticated user
- Return created todo with 201 status

#### GET /api/v1/todos

Get all todos:

- Return all todos from ALL users (authenticated users can see others' todos)
- Hide `description` field for todos not owned by the current user
- Query pagination (default page=1 & page_size=20)
- Query filtering by priority/completed
- Search title functionality
- Include `user_id` or `User` to identify owner

#### GET /api/v1/todos/{todo_id}

Get single todo:

- Only owner can access full details
- Return 403 if user tries to access someone else's todo
- Return 404 if todo doesn't exist

#### PUT /api/v1/todos/{todo_id} or PATCH /api/v1/todos/{todo_id}

Update todo:

- Only owner can update
- Support partial updates (PATCH)
- Validate input fields
- Return 403 if not owner

#### DELETE /api/v1/todos/{todo_id}

Delete todo:

- Only owner can delete
- Return 204 on success
- Return 403 if not owner

#### PATCH /api/v1/todos/{todo_id}/complete

Mark todo as complete:

- Only owner can mark as complete
- Toggle `completed` status
- Return updated todo

### Task 3: Implement Todo Statistics Endpoint

#### GET /api/v1/todos/stats

Get statistics for the authenticated user's todos:

**Response format**:

```json
{
  "total": 10,
  "completed": 4,
  "pending": 6,
  "by_priority": {
    "LOW": 3,
    "MEDIUM": 5,
    "HIGH": 2
  }
}
```

**Requirements**:

- Only count todos belonging to the authenticated user
- Calculate totals efficiently (use database aggregation if possible)
- Return proper schema with type validation

### Task 4: Write Test Cases

**Priority: CRITICAL**

Create test file `tests/test_todos.py` with the following test cases:

**Required Tests**:

1. **`test_create_todo_success`** - Create todo successfully
   - Test that an authenticated user can create a todo
   - Verify the response contains correct data
   - Verify status code is 201

2. **`test_get_all_todos`** - Get all todos
   - Test that an authenticated user can get all todos
   - Verify description is hidden for todos not owned by the user
   - Verify todos show user_id or username to identify owner
   - Verify status code is 200

Run tests:

```bash
uv run pytest tests/test_todos.py -v
```
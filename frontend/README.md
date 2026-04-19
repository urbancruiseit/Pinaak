## Urbanatour Frontend

Next.js 14 dashboard for Urbanatour operations. The UI now integrates with the local Node.js backend for admin and user authentication.

### Local Setup

1. Install dependencies:
	```bash
	npm install
	```
2. Copy `.env.local.example` to `.env.local` and configure the API base URL (defaults to `http://localhost:4000/api`).
3. Run the development server:
	```bash
	npm run dev
	```

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` – points to the backend API (e.g. `http://localhost:4000/api`).

### Authentication Flow

- Login form posts to the backend and stores the session in local storage.
- Admin-only modules (such as Admin Management) are hidden from users who do not have the `admin` role.

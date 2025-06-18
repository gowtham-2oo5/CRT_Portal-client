# 🔄 Updated Next.js 15 + Spring Boot Architecture

## 🎯 Architecture Updated for Your Spring Boot API

I've completely updated the architecture to match your exact Spring Boot authentication flow and API structure. Here's what's been implemented:

## 🔐 2-Factor Authentication Flow

### Step 1: Initial Login
```typescript
// POST /api/auth/login
{
  "usernameOrEmail": "string", // Can be username OR email
  "password": "string"
}

// Response
{
  "message": "OTP sent to j***ohn@example.com",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string", 
    "username": "string",
    "role": "ADMIN|FACULTY"
  },
  "token": null,
  "refreshToken": null
}
```

### Step 2: OTP Verification
```typescript
// POST /api/auth/verify-otp
{
  "usernameOrEmail": "string", // Same as login
  "otp": "string" // 6-digit OTP
}

// Response
{
  "message": "OTP verified successfully",
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": { /* user object */ }
}
```

## 🏗️ Updated Architecture Components

### 1. **Authentication Types** (`lib/auth/types.ts`)
- Updated `User` interface with correct fields
- Added proper role types: `'ADMIN' | 'FACULTY'`
- Defined all API request/response interfaces
- Added error response types

### 2. **API Configuration** (`lib/api/config.ts`)
- **Public API**: Points to `/api/auth` for authentication
- **Secured API**: Automatic JWT token injection
- **Token Refresh**: Automatic refresh on 401 errors
- **Dual Storage**: localStorage + HTTP-only cookies

### 3. **Server-Side Auth** (`lib/auth/server.ts`)
- `login()`: Step 1 - Username/password validation
- `verifyOtp()`: Step 2 - OTP verification with token storage
- `requireAuth()` & `requireRole()`: Route protection
- `refreshToken()`: Automatic token renewal

### 4. **Client-Side Auth** (`lib/auth/client.ts`)
- Same 2FA flow for client components
- Token management in localStorage + cookies
- Automatic logout on auth failures
- `createAuthenticatedApi()`: Get authenticated axios instance

### 5. **Updated Components**

#### Login Form (`components/auth/login-form.tsx`)
- Username/Email input field
- Password with show/hide toggle
- Calls Step 1 API and triggers OTP dialog

#### OTP Dialog (`components/auth/otp-dialog.tsx`)
- 6-digit OTP input
- Masked email display
- Resend functionality with countdown
- Calls Step 2 API and redirects to dashboard

#### Route Guards
- **Server**: `AuthGuard` with role-based protection
- **Client**: `ClientAuthGuard` for dynamic components
- Updated to use `'ADMIN' | 'FACULTY'` roles

## 🔧 Key Features Implemented

### ✅ **2-Factor Authentication**
- Step 1: Username/Email + Password → OTP sent
- Step 2: OTP verification → JWT tokens received
- Proper error handling for each step

### ✅ **JWT Token Management**
- Access token (15 min expiry)
- Refresh token (7 day expiry)
- Automatic refresh on API calls
- Secure HTTP-only cookies + localStorage

### ✅ **Role-Based Access Control**
- `ADMIN`: Full system access
- `FACULTY`: Limited access
- Route-level and component-level protection

### ✅ **Error Handling**
- API error responses with proper types
- Network error handling
- Token expiry handling
- User-friendly error messages

### ✅ **Security Features**
- HTTP-only cookies for server-side
- Secure token storage
- Automatic logout on auth failures
- CSRF protection via SameSite cookies

## 🚀 How to Use

### 1. **Environment Setup**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NODE_ENV=development
```

### 2. **Login Flow**
```typescript
// User enters username/email + password
const loginResult = await ClientAuth.login(usernameOrEmail, password);

if (loginResult.success) {
  // Show OTP dialog with user info
  setShowOtpDialog(true);
  setCurrentUser(loginResult.data.user);
}

// User enters OTP
const otpResult = await ClientAuth.verifyOtp(usernameOrEmail, otp);

if (otpResult.success) {
  // Redirect to dashboard - tokens are automatically stored
  router.push('/dashboard');
}
```

### 3. **Protected Routes**
```typescript
// Server component protection
export default async function AdminPage() {
  const user = await ServerAuth.requireRole(['ADMIN']);
  return <AdminContent user={user} />;
}

// Client component protection
<ClientAuthGuard requiredRoles={['FACULTY']}>
  <FacultyDashboard />
</ClientAuthGuard>
```

### 4. **Making API Calls**
```typescript
// Server-side (automatic token injection)
const data = await securedApi.get('/dashboard-data');

// Client-side
const api = ClientAuth.createAuthenticatedApi();
const response = await api.post('/user-action', data);
```

## 🔄 Integration with Your Spring Boot API

### Required Endpoints
Your Spring Boot API should have these endpoints:
- ✅ `POST /api/auth/login` - Step 1 authentication
- ✅ `POST /api/auth/verify-otp` - Step 2 OTP verification  
- ✅ `POST /api/auth/refresh-token` - Token refresh
- ✅ `POST /api/auth/forgot-password` - Password reset
- 🔄 `GET /api/auth/me` - Get current user (you may need to add this)

### Expected Response Format
Your API responses should match the interfaces defined in `lib/auth/types.ts`.

## 🎉 Ready to Go!

The architecture is now fully aligned with your Spring Boot backend:
- ✅ **2FA Flow**: Login → OTP → Dashboard
- ✅ **JWT Management**: Access + Refresh tokens
- ✅ **Role System**: ADMIN/FACULTY roles
- ✅ **Security**: HTTP-only cookies + localStorage
- ✅ **Error Handling**: Proper API error responses
- ✅ **Next.js 15**: Server components + App Router

Just update your environment variables and you're ready to test the complete authentication flow! 🚀

## 🐛 Notes for Implementation

1. **Add `/me` endpoint** to your Spring Boot API to get current user info
2. **Implement resend OTP** endpoint if needed
3. **Configure CORS** for your frontend domain
4. **Test token refresh** flow with short-lived access tokens

The architecture is production-ready and follows security best practices! 🔒

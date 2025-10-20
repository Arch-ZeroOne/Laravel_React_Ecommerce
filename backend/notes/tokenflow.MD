# Sanctum Token Flow — Reference Notes

## Overview

This document summarizes the **full token flow** when using **Laravel Sanctum** for API token authentication and includes a step-by-step implementation with code samples. Use this as a quick reference when building/registering users, issuing tokens, accessing protected routes, and revoking tokens.

---

## Table of Contents

-   Overview
-   Token Flow (High-level)
-   Database & Setup
-   Implementation (step-by-step)

    -   Install & publish
    -   Migrate
    -   User model
    -   AuthService
    -   Form Requests
    -   AuthController (register, login, logout)
    -   Routes

-   Example requests (Postman)
-   Token lifecycle (detailed)
-   Best practices
-   Quick cheatsheet

---

## Token Flow (High-level)

1. **Register / Login** → Backend calls `$user->createToken(...)` and returns the token to client.
2. **Client stores** token securely (e.g. secure storage on mobile, or appropriate storage for web).
3. **Client sends** token on every protected API request using header: `Authorization: Bearer <token>`.
4. **Sanctum middleware** verifies token against `personal_access_tokens`, resolves the owning user, and sets `auth()->user()`.
5. **Server responds** to request if token valid; otherwise returns `401 Unauthenticated`.
6. **Logout / Revoke** → delete the token from DB (either current or all tokens).

---

## Database & Setup

Sanctum uses the `personal_access_tokens` table to store tokens. Each token row includes a reference to the `tokenable` (the owning model), a hashed token, name, abilities, and timestamps.

---

## Implementation (step-by-step)

### 1) Install & publish

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 2) Migrate

```bash
php artisan migrate
```

This creates the `personal_access_tokens` table.

### 3) User model

Add the `HasApiTokens` trait to the `User` model.

```php
// app/Models/User.php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name','email','password'];
    protected $hidden = ['password','remember_token'];
}
```

### 4) AuthService (business logic)

Keep controller thin and move creation/login logic into a service.

```php
// app/Services/AuthService.php
namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
    }

    public function login(array $credentials): ?User
    {
        if (!auth()->attempt($credentials)) {
            return null;
        }

        return auth()->user();
    }
}
```

### 5) Form Requests (validation)

Use FormRequest classes for validation logic.

```php
// app/Http/Requests/RegisterRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ];
    }
}

// app/Http/Requests/LoginRequest.php
class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ];
    }
}
```

### 6) AuthController (register, login, logout)

```php
// app/Http/Controllers/AuthController.php
namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login($request->validated());

        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        // Delete only the current access token
        $request->user()->currentAccessToken()->delete();

        // or to delete all tokens for the user use:
        // $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
```

### 7) Routes

```php
// routes/api.php
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', function (Request $request) {
        return response()->json($request->user());
    });

    Route::post('/logout', [AuthController::class, 'logout']);
});
```

---

## Example Requests (Postman)

### Register

**POST** `/api/register` (JSON body)

```json
{
    "name": "Windyl",
    "email": "windyl@example.com",
    "password": "password",
    "password_confirmation": "password"
}
```

Response includes `token`.

### Login

**POST** `/api/login` (JSON body)

```json
{ "email": "windyl@example.com", "password": "password" }
```

Response includes `token`.

### Access protected route

**GET** `/api/profile`
Headers:

```
Authorization: Bearer <token>
Accept: application/json
```

### Logout

**POST** `/api/logout`
Headers: same `Authorization: Bearer <token>`

---

## Token lifecycle (detailed)

-   **Creation:** `createToken()` inserts a record in `personal_access_tokens` and returns the plain token for the client.
-   **Storage (client):** store securely on client; web apps should carefully choose storage strategy (cookies vs localStorage). Mobile apps should use secure storage.
-   **Verification:** Sanctum middleware hashes supplied token and matches the DB entry, then resolves the `tokenable` user.
-   **Revocation:** delete single token (`currentAccessToken()->delete()`), delete all tokens (`tokens()->delete()`), or selectively remove tokens.

---

## Best practices

-   **Use HTTPS** in production — never send tokens over plain HTTP.
-   **Only issue tokens on login/register** (do not create a token for every request).
-   **Revoke tokens on logout** and on sensitive actions (password change or suspected compromise).
-   **Limit token abilities** when appropriate: `$user->createToken('mobile', ['read', 'write'])->plainTextToken;`
-   **Avoid long-lived tokens if high-risk** — implement manual expiry by storing an expiry timestamp and checking it in middleware if needed.
-   **Send `Accept: application/json`** on API requests to ensure JSON responses on errors.

---

## Quick cheatsheet

-   Create token: `$user->createToken('name', ['ability'])->plainTextToken;`
-   Current token: `$request->user()->currentAccessToken();`
-   Revoke current token: `$request->user()->currentAccessToken()->delete();`
-   Revoke all tokens: `$request->user()->tokens()->delete();`
-   Check ability: `$request->user()->tokenCan('ability');`

---

## References

-   Laravel Sanctum docs: [https://laravel.com/docs/sanctum](https://laravel.com/docs/sanctum)
-   Personal access tokens table migration and structure: `database/migrations/*_create_personal_access_tokens_table.php`

<!-- End of README -->

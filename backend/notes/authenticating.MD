# 🔐 Laravel Authentication Deep Dive

A comprehensive guide to understanding Laravel's authentication system, covering the Auth facade, Guards, Providers, and the Authenticatable contract.

---

## 📋 Table of Contents

-   [Overview](#overview)
-   [The Auth Facade](#the-auth-facade)
-   [Authenticatable Contract](#authenticatable-contract)
-   [Guards and Providers](#guards-and-providers)
-   [Auth::attempt() Lifecycle](#authattempt-lifecycle)
-   [Common Errors and Solutions](#common-errors-and-solutions)
-   [Working with Auth::user()](#working-with-authuser)
-   [Token-Based Authentication (Sanctum)](#token-based-authentication-sanctum)
-   [Quick Reference](#quick-reference)

---

## 📘 Overview

This guide explores Laravel's authentication system, focusing on:

-   **Auth facade** - The main interface for authentication
-   **Guards** - How users are authenticated (sessions, tokens, etc.)
-   **Providers** - Where user data is retrieved from
-   **Authenticatable contract** - Making models authentication-ready
-   **Auth::attempt()** - The complete authentication lifecycle
-   **Common errors** - Troubleshooting authentication issues

---

## 🔑 The Auth Facade

The `Auth` facade provides convenient access to Laravel's authentication system.

### Key Responsibilities

-   Logging users in and out
-   Checking authentication status
-   Retrieving the authenticated user
-   Managing multiple guards (`web`, `api`, custom guards)

### Common Methods

| Method                        | Description                                        |
| ----------------------------- | -------------------------------------------------- |
| `Auth::attempt($credentials)` | Attempts to log in a user by verifying credentials |
| `Auth::user()`                | Returns the currently authenticated user           |
| `Auth::guard('api')->user()`  | Returns the user using a specific guard            |
| `Auth::logout()`              | Logs the user out                                  |
| `Auth::check()`               | Checks if a user is authenticated                  |
| `Auth::id()`                  | Returns the authenticated user's ID                |

### Example Usage

```php
// Attempt login
if (Auth::attempt(['email' => $email, 'password' => $password])) {
    // Authentication successful
    $user = Auth::user();
}

// Using a specific guard
if (Auth::guard('accounts')->attempt($credentials)) {
    // Logged in via 'accounts' guard
}

// Logout
Auth::logout();
```

---

## 🧩 Authenticatable Contract

An **Authenticatable** is any model that can be authenticated (logged in). It must implement the `Illuminate\Contracts\Auth\Authenticatable` interface.

### Required Methods

```php
getAuthIdentifierName()    // Returns the name of unique identifier (e.g., 'id')
getAuthIdentifier()        // Returns the unique identifier value
getAuthPassword()          // Returns the hashed password
getRememberToken()         // Returns the remember token
setRememberToken($value)   // Sets the remember token
getRememberTokenName()     // Returns the remember token column name
```

### Implementation Example

```php
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Account extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'accounts';
    protected $primaryKey = 'account_id';

    protected $fillable = [
        'firstname',
        'lastname',
        'email',
        'username',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
```

> **Important:** Your model must extend `Illuminate\Foundation\Auth\User as Authenticatable`, not just `Model`.

---

## ⚙️ Guards and Providers

Laravel uses **Guards** and **Providers** to handle authentication.

### Guards

Guards define **how** users are authenticated for each request.

**Configuration:** `config/auth.php`

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'accounts' => [
        'driver' => 'session',
        'provider' => 'accounts',
    ],

    'api' => [
        'driver' => 'sanctum',
        'provider' => 'users',
    ],
],
```

### Providers

Providers define **where** users are retrieved from (database, eloquent, custom).

**Configuration:** `config/auth.php`

```php
'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => App\Models\User::class,
    ],

    'accounts' => [
        'driver' => 'eloquent',
        'model' => App\Models\Account::class,
    ],
],
```

### Guard-Provider Relationship

```
Guard (accounts) → Provider (accounts) → Model (Account::class)
```

---

## 🔄 Auth::attempt() Lifecycle

When you call:

```php
Auth::guard('accounts')->attempt([
    'username' => 'windyl',
    'password' => 'secret'
]);
```

Laravel executes the following steps:

### Step-by-Step Process

1. **Check the Guard**

    - Identifies which guard is being used (`accounts`)

2. **Find the Provider**

    - Locates the provider linked to that guard (`accounts` → `eloquent`)

3. **Fetch the Model**

    - Uses the provider's model to find the user by credentials
    - Queries: `SELECT * FROM accounts WHERE username = 'windyl'`

4. **Validate Credentials**

    - Verifies the password using:

    ```php
    Hash::check($inputPassword, $user->password)
    ```

5. **Check Authenticatable Type**

    - Ensures the model implements `Illuminate\Contracts\Auth\Authenticatable`
    - **If not**, throws an error (see [Common Errors](#common-errors-and-solutions))

6. **Log the User In**
    - If successful, stores the user's ID in the session (for session guards)
    - Creates a session token for the authenticated user

### Return Value

-   Returns `true` on success
-   Returns `false` on failure (invalid credentials)

---

## 🚨 Common Errors and Solutions

### Error: Authenticatable Type Not Recognized

```
Argument #1 ($user) must be of type Illuminate\Contracts\Auth\Authenticatable,
App\Models\Account given
```

#### Cause

Your model extends `Model` instead of `Authenticatable`.

#### Solution

Change your model to extend the correct class:

```php
// ❌ Wrong
use Illuminate\Database\Eloquent\Model;
class Account extends Model { }

// ✅ Correct
use Illuminate\Foundation\Auth\User as Authenticatable;
class Account extends Authenticatable { }
```

#### Verify Configuration

Ensure `config/auth.php` is properly configured:

```php
'guards' => [
    'accounts' => [
        'driver' => 'session',
        'provider' => 'accounts',
    ],
],

'providers' => [
    'accounts' => [
        'driver' => 'eloquent',
        'model' => App\Models\Account::class,
    ],
],
```

---

## 🧠 Working with Auth::user()

`Auth::user()` returns the currently authenticated user.

### How It Works

-   Retrieves the user instance from the active guard's session or token
-   Returns your Authenticatable model instance (e.g., `Account` or `User`)
-   Returns `null` if no user is authenticated

### Examples

```php
// Get current user
$user = Auth::user();
echo $user->username;

// Using a specific guard
$account = Auth::guard('accounts')->user();
echo $account->firstname;

// Check if user is authenticated
if (Auth::check()) {
    $userId = Auth::id();
}
```

---

## 🔒 Token-Based Authentication (Sanctum)

Laravel Sanctum provides a simple token-based authentication for SPAs and mobile apps.

### Authentication Flow

1. **User logs in via credentials**

    ```php
    if (Auth::attempt($credentials)) {
        $user = Auth::user();
    }
    ```

2. **Generate API token**

    ```php
    $token = $user->createToken('api-token')->plainTextToken;
    ```

3. **Token is stored in database**

    - Table: `personal_access_tokens`

4. **Client includes token in requests**

    ```
    Authorization: Bearer <token>
    ```

5. **Sanctum validates each request**

    - Checks token validity
    - Retrieves the associated user

6. **Logout: Revoke token**

    ```php
    // Revoke current token
    $request->user()->currentAccessToken()->delete();

    // Revoke all tokens
    $request->user()->tokens()->delete();
    ```

### Setup Example

```php
// Generate token on login
public function login(Request $request)
{
    $credentials = $request->only('username', 'password');

    if (Auth::guard('accounts')->attempt($credentials)) {
        $user = Auth::guard('accounts')->user();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    return response()->json(['error' => 'Unauthorized'], 401);
}

// Protected route
Route::middleware('auth:sanctum')->get('/profile', function (Request $request) {
    return $request->user();
});
```

---

## 📚 Quick Reference

### Core Concepts

| Concept                  | Description                            | Key Class/Interface                         |
| ------------------------ | -------------------------------------- | ------------------------------------------- |
| **Authenticatable**      | A model that can be logged in          | `Illuminate\Contracts\Auth\Authenticatable` |
| **Guard**                | Defines how authentication is handled  | `Illuminate\Contracts\Auth\Guard`           |
| **Provider**             | Defines where users are retrieved from | `Illuminate\Contracts\Auth\UserProvider`    |
| **Auth Facade**          | Entry point to authentication system   | `Illuminate\Support\Facades\Auth`           |
| **SessionGuard**         | Handles session-based authentication   | `Illuminate\Auth\SessionGuard`              |
| **EloquentUserProvider** | Retrieves users using Eloquent ORM     | `Illuminate\Auth\EloquentUserProvider`      |

### Checklist for Proper Authentication

✅ Model extends `Authenticatable` (not just `Model`)  
✅ Guards configured correctly in `config/auth.php`  
✅ Providers configured with correct model class  
✅ Use `Auth::guard()->attempt()` for login  
✅ Use `Auth::user()` for retrieving authenticated user  
✅ For APIs, combine with Sanctum for token-based auth

---

## 📝 Notes

-   **Default Guard:** The `web` guard is used by default when no guard is specified
-   **Password Hashing:** Always use `Hash::make()` when storing passwords
-   **Remember Me:** Pass `true` as second parameter to `attempt()` for "remember me" functionality
    ```php
    Auth::attempt($credentials, $remember = true);
    ```

---

## 📖 Additional Resources

-   [Laravel Authentication Documentation](https://laravel.com/docs/authentication)
-   [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
-   [Guards and Providers Deep Dive](https://laravel.com/docs/authentication#adding-custom-guards)

---

**Author:** Laravel Dev Notes  
**Last Updated:** October 16, 2025  
**Topic:** Laravel Auth & Sanctum Internal Flow

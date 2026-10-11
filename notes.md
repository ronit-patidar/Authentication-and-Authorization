# Authentication

## Token-Based Authentication

### Access Token and Refresh Token

- **Access token** → lets the user use any protected feature of the server.
- **Refresh token** → lets the user create a new access token when the old one expires.

(Access token ki madad se user server ka koi bhi feature use kar sakta hai, aur refresh token ki madad se user apna access token create kar sakta hai.)

### Where Each Token Is Stored

- **Refresh token** → stored in cookies (HttpOnly, Secure, SameSite)
- **Access token** → stored in memory (a JS variable / app state)

### Ideal Expiration Time

| Token         | Expiration |
|---------------|------------|
| Access token  | 15 min     |
| Refresh token | 7 days     |

---

## Q&A

### 1. Why do we need 2 tokens?

- The access token is sent with **every API request**, so it has the highest chance of being exposed. Making it short-lived (15 min) limits the damage if it is stolen.
- A single short-lived token would force the user to log in every 15 minutes. A single long-lived token would be dangerous if stolen.
- The refresh token is long-lived (7 days) but is sent **only to the refresh endpoint**, so it is exposed far less often.
- Refresh tokens are usually stored on the server (DB) too, so they can be **revoked** (logout, stolen device) or **rotated** on every use.

**Result:** good security (short-lived access) + good user experience (stay logged in for days).

### 2. Why are localStorage, cookies, and memory storage not safe?

No browser storage is 100% safe. Each has a weakness:

| Storage | Weakness |
|---|---|
| **localStorage** | Readable by any JavaScript on the page, so an **XSS** attack can steal the token. It also persists until manually cleared. |
| **Normal cookies** | The browser attaches them automatically to requests, so they are open to **CSRF**. If the cookie is not `HttpOnly`, JS can also read it (XSS). |
| **Memory** | Not persisted, so it is lost on page refresh or tab close. Still reachable by XSS while the page is running, but much harder to steal. |

**That is why we combine them:**

- Refresh token → `HttpOnly` + `Secure` + `SameSite` cookie. JS cannot read it, and it is only used to get a new access token.
- Access token → memory. It is never written to disk and is not auto-sent by the browser.
- On page reload, the access token in memory is gone, so the app silently calls the refresh endpoint (the cookie is sent) and gets a new one.

### 3. Why are tokens sent explicitly in the header?

- Cookies are sent **automatically** by the browser, even if the request comes from a malicious site (CSRF).
- A header like `Authorization: Bearer <access_token>` must be **set manually by your JS code**, so another site cannot make the browser attach it.
- It also works for non-browser clients (mobile apps, Postman) and for APIs on a different domain, without cookie/CORS complications.
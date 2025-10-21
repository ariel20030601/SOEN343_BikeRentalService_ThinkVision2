// Define the base API URL (adjust as needed)
const API_URL = "http://localhost:8080/users";

// 1️Define interfaces for data types
export interface RegisterData {
    username: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    address: String,
    paymentInfo: String
}

export interface LoginData {
    username: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
}

// Define return types (optional but helpful)
export interface AuthResponse {
    token: string;
    user: User;
}

// Register new user
export async function register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        // try to extract a helpful message from body
        let message = `Registration failed (${response.status})`;
        try {
            const text = await response.text();
            if (text) message = text;
        } catch (e) {
            // ignore
        }
        const err: any = new Error(message);
        err.status = response.status;
        throw err;
    }

    return response.json();
}

// Check whether a username is available. Returns true when available, false when taken.
export async function checkUsername(username: string): Promise<boolean> {
    // This endpoint is expected to return 200 when available, 409 when taken.
    const url = `${API_URL}/check-username?username=${encodeURIComponent(username)}`;
    const response = await fetch(url, { method: 'GET' });
    if (response.status === 200) return true;
    if (response.status === 409) return false;
    // For other responses, assume unavailable and surface an error
    const errText = await response.text().catch(() => '');
    const err: any = new Error(errText || `Unexpected response ${response.status}`);
    err.status = response.status;
    throw err;
}

// Login
export async function login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    return response.json();
}

// Logout
export async function logout(token: string): Promise<void> {
    await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Fetch user info from token
export async function fetchUserMe(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user");
    }

    return response.json();
}

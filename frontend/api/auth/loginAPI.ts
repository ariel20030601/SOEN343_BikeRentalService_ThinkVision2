// Login and Authentication API
const API_URL = "http://localhost:8080/users";

// Interfaces
export interface RegisterData {
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    address: string,
    paymentInfo: string
}

export interface LoginData {
    username: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    flexBalance: number;
    loyaltyTier: string;
}

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
        let message = `Registration failed (${response.status})`;
        try {
            const text = await response.text();
            if (text) message = text;
        } catch (e) {
        }
        const err: any = new Error(message);
        err.status = response.status;
        throw err;
    }

    return response.json();
}

// Check username availability
export async function checkUsername(username: string): Promise<boolean> {
    const url = `${API_URL}/check-username?username=${encodeURIComponent(username)}`;
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        const err: any = new Error(errText || `checking`);
        err.status = response.status;
        throw err;
    }
    const body = await response.json().catch(() => ({ available: false }));
    return Boolean(body?.available);
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

export async function fetchUserTier(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/tier`, {
        method: "GET",
    });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Failed to fetch user tier (${response.status})`);
    }
    return response.json();
}
// Define the base API URL (adjust as needed)
const API_URL = "http://localhost:8080/users";

// 1️⃣ Define interfaces for data types
export interface RegisterData {
    username: string;
    email: string;
    password: string;
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

// 2️⃣ Define return types (optional but helpful)
export interface AuthResponse {
    token: string;
    user: User;
}

// 3️⃣ Register new user
export async function register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Registration failed");
    }

    return response.json();
}

// 4️⃣ Login
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

// 5️⃣ Logout (if your backend supports token invalidation)
export async function logout(token: string): Promise<void> {
    await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

// 6️⃣ Fetch user info from token
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

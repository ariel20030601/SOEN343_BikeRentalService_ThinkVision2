// Dashboard API - User Management
const API_URL = "http://localhost:8080/users";

export interface User {
    id: number;
    username: string;
    email: string;
}

// Fetch all users
export async function fetchAllUsers(token: string): Promise<User[]> {
    const res = await fetch(`${API_URL}/all`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Failed to fetch users (${res.status})`);
    }
    return res.json();
}

// Fetch all stations
export async function fetchStations(operatorId: number){
    const response = await fetch('http://localhost:8080/api/stations');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}
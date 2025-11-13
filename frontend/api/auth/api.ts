// Define the base API URL (adjust as needed)
const API_URL = "http://localhost:8080/users";
const PRC_API_URL = "http://localhost:8080/api/prc";

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

// ---------- Billing History ----------
export type TripSummary = {
  tripId: number;
  bikeType: string;
  startStationName: string;
  endStationName: string;
  startTime: number; 
  endTime: number;   
  durationMinutes: number;
  cost: number;
};

export async function fetchBillingHistory(userId: number): Promise<TripSummary[]> {
  const res = await fetch(`${PRC_API_URL}/history/${userId}`, {
    method: "GET",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to fetch history (${res.status})`);
  }
  return res.json();
}

// Define the base URL for bikes (adjust as needed)
const BIKES_API_URL = "http://localhost:8080/api/bikes"; // ← your backend endpoint root

// ---------- Types ----------
export type BikeStatus = "AVAILABLE" | "RESERVED" | "ON_TRIP";

export interface Reservation {
  id: string;
  bikeId: string;
  stationId: string;
  reservedAt: string;
  expiresAt: string;
  active: boolean;
}

export interface Trip {
  id: number;
  riderId: number;
  bikeId: string;
  startStationId: string;
  endStationId?: string;
  startTime: string;
  endTime?: string;
  active: boolean;
}

// ---------- Reserve Bike ----------
export async function reserveBike(
  riderId: number,
  stationId: string,
  bikeId: string
): Promise<Reservation> {
  const response = await fetch(`${BIKES_API_URL}/reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ riderId, stationId, bikeId }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Reservation failed (${response.status})`);
  }

  return response.json();
}

// ---------- Checkout Bike ----------
export async function checkoutBike(
  riderId: number,
  stationId: string,
  bikeId: string
): Promise<Trip> {
  const response = await fetch(`${BIKES_API_URL}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ riderId, stationId, bikeId }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Checkout failed (${response.status})`);
  }

  return response.json();
}

// ---------- Return Bike ----------
export async function returnBike(
  riderId: number,
  stationId: string,
  bikeId: string
): Promise<Trip> {
  const response = await fetch(`${BIKES_API_URL}/return`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ riderId, stationId, bikeId }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Return failed (${response.status})`);
  }

  return response.json();
}

// ---------- Pricing and Billing ----------

export interface PricingPlan {
  name?: string;
  pricePerMinute?: number;
  baseFare?: number;
}

export interface TripSummaryDTO {
  tripId: number;
  riderId?: number;
  bikeId?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  cost?: number;
  pricingPlan?: PricingPlan;
  [key: string]: any;
}

// GET /api/prc/getPricingPlans
export async function getPricingPlans(): Promise<PricingPlan[]> {
  const res = await fetch(`${PRC_API_URL}/getPricingPlans`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to load pricing plans (${res.status})`);
  }

  const raw = await res.json().catch(() => []);
  if (!Array.isArray(raw)) return [];

  const toNumber = (v: any): number | undefined =>
    v === null || typeof v === "undefined" ? undefined : Number(v);

  return raw.map((p: any) => {
    const name = p.planName ;
    const baseFare = p.baseFare;
    const pricePerMinute = p.additionalFarePerMinute;
    return {
      name,
      baseFare,
      pricePerMinute,
    } as PricingPlan;
  });
}


// GET /api/prc/summary?tripId=...
export async function getTripSummary(tripId: number): Promise<TripSummaryDTO> {
  const url = `${PRC_API_URL}/summary?tripId=${encodeURIComponent(String(tripId))}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to load trip summary (${res.status})`);
  }
  return res.json();
}

// GET /api/prc/history/{userId}
export async function getBillingHistory(userId: number): Promise<TripSummaryDTO[]> {
  const res = await fetch(`${PRC_API_URL}/history/${encodeURIComponent(String(userId))}`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to load billing history (${res.status})`);
  }
  return res.json();
}
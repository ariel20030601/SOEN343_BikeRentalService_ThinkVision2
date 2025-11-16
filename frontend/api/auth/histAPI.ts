// Billing History API
const PRC_API_URL = "http://localhost:8080/api/prc";

// Interfaces
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

// Fetch Billing History (original version)
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

// Get Billing History (alternative version with TripSummaryDTO)
export async function getBillingHistory(userId: number): Promise<TripSummaryDTO[]> {
    const res = await fetch(`${PRC_API_URL}/history/${encodeURIComponent(String(userId))}`, { method: "GET" });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Failed to load billing history (${res.status})`);
    }
    return res.json();
}
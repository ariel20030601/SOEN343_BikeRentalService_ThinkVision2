// Billing History API
const PRC_API_URL = "http://localhost:8080/api/prc";

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

// Get Pricing Plans
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
        const name = p.planName;
        const baseFare = p.baseFare;
        const pricePerMinute = p.additionalFarePerMinute;
        return {
            name,
            baseFare,
            pricePerMinute,
        } as PricingPlan;
    });
}

// GET /api/prc/history/{userId}
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

// GET /api/prc/history/{userId} - Alternative with detailed DTOs
export async function getBillingHistory(userId: number): Promise<TripSummaryDTO[]> {
    const res = await fetch(`${PRC_API_URL}/history/${encodeURIComponent(String(userId))}`, { method: "GET" });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Failed to load billing history (${res.status})`);
    }
    return res.json();
}

// Get Trip Summary
export async function getTripSummary(tripId: number): Promise<TripSummaryDTO> {
    const url = `${PRC_API_URL}/summary?tripId=${encodeURIComponent(String(tripId))}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Failed to load trip summary (${res.status})`);
    }
    return res.json();
}

export async function getUserFlexBalance(userId: number): Promise<number> {
    const url = `${PRC_API_URL}/flexDollars/${userId}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Failed to load user flex balance (${res.status})`);
    }
    const body = await res.json().catch(() => ({ balance: 0 }));
    return Number(body?.balance) || 0;
}
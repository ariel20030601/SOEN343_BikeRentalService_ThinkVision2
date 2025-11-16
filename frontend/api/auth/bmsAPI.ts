// Bike Management System API
const BIKES_API_URL = "http://localhost:8080/api/bikes";

// Types
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

// Reserve Bike
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

// Checkout Bike
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

// Return Bike
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
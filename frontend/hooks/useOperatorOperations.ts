import { StationData } from '@/types/station';

const API_BASE = 'http://localhost:8080/api/operator';

export function useOperatorOperations(operatorId: number, onStationsRefresh: () => Promise<void>) {
  const handleMoveBike = async (
    fromStationId: string,
    toStationId: string,
    bikeId: string
  ) => {
    const response = await fetch(
      `${API_BASE}/move-bike?operatorId=${operatorId}&fromStationId=${fromStationId}&toStationId=${toStationId}&bikeId=${bikeId}`,
      { method: 'POST' }
    );
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    await onStationsRefresh();
  };

  const handleToggleDockMaintenance = async (dockId: string) => {
    const response = await fetch(
      `${API_BASE}/toggle-dock?operatorId=${operatorId}&dockId=${dockId}`,
      { method: 'POST' }
    );
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
  };

  const handleAddBikes = async (
    station: StationData,
    counts: { standard: number; eBike: number }
  ) => {
    const total = (counts?.standard ?? 0) + (counts?.eBike ?? 0);
    if (!total) return;

    const addOne = async (type: 'STANDARD' | 'E_BIKE', idx: number) => {
      const bikeId = `${station.id}-${type === 'E_BIKE' ? 'EB' : 'SB'}-${Date.now()}-${idx}`;
      const url = `${API_BASE}/add-bike?operatorId=${operatorId}&stationId=${encodeURIComponent(station.id)}&bikeId=${encodeURIComponent(bikeId)}&type=${type}`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    };

    let added = 0;
    
    for (let i = 0; i < (counts.standard ?? 0); i++) {
      try {
        await addOne('STANDARD', i);
        added++;
      } catch (e) {
        console.error('Add STANDARD failed at', i, e);
        break;
      }
    }

    for (let i = 0; i < (counts.eBike ?? 0); i++) {
      try {
        await addOne('E_BIKE', i);
        added++;
      } catch (e) {
        console.error('Add E_BIKE failed at', i, e);
        break;
      }
    }

    await onStationsRefresh();
    console.log(`Success: added ${added} bikes`);
  };

  return {
    handleMoveBike,
    handleToggleDockMaintenance,
    handleAddBikes,
  };
}
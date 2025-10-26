export interface StationData {
    id: string;
    title: string;
    bikes: string;
    ebikes: string;
    docks: string;
}

export const STATIONS_DATA: StationData[] = [
    {id: "1", title: "Station 1", bikes: "13", ebikes: "0", docks: "10"},
    {id: "2", title: "Station 2", bikes: "10", ebikes: "5", docks: "11"},
    {id: "3", title: "Station 3", bikes: "9", ebikes: "0", docks: "5"}
];
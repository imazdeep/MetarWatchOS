export interface AirportInfo {
  icao: string;
  name: string;
  runways?: string[];
}

export interface MetarData {
  raw: string;
  station: string;
  time: string; // e.g. "150350Z"
  wind?: {
    direction: string;
    speed: string;
    gusts?: string;
    unit: string;
  };
  visibility?: string;
  clouds?: { type: string; altitude?: string }[];
  temperature?: string;
  dewpoint?: string;
  altimeter?: string; // e.g. Q1017
  flightCategory?: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | 'UNKNOWN';
}

export interface AppState {
  icao: string;
  airport: AirportInfo | null;
  metar: MetarData | null;
  isLoading: boolean;
  error: string | null;
  /** Station code of the request that produced `error`. */
  failedIcao?: string;
  lastUpdated: Date | null;
}

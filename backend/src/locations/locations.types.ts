export interface LocationRow {
  id: string;
  userId: string;
  name: string;
  photoPath: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
}

export interface CreateLocationInput {
  name: string;
  photoPath?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateLocationInput {
  name?: string;
  photoPath?: string;
  latitude?: number;
  longitude?: number;
}

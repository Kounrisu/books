export interface LocationRow {
  id: string;
  userId: string;
  name: string;
  photoPath: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  parentLocationId: string | null;
}

export interface CreateLocationInput {
  name: string;
  photoPath?: string;
  latitude?: number;
  longitude?: number;
  parentLocationId?: string | null;
}

export interface UpdateLocationInput {
  name?: string;
  photoPath?: string;
  latitude?: number;
  longitude?: number;
  parentLocationId?: string | null;
}

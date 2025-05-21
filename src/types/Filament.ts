// types/Filament.ts
export interface Filament {
  id: string;
  name: string;
  materialType: string;
  brand: string;
  color: string;
  weightRemaining: number;
  spoolWeight: number;
  notes: string | null;
  createdAt: string; // Or Date if you handle dates differently
  updatedAt: string; // Or Date
  userId: string; // Assuming you want this client-side or just for type safety
}

export interface FilamentWithScore extends Filament {
  _matchScore: number;
}
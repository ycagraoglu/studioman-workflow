export type AssetType = 'location' | 'personnel' | 'equipment' | 'vehicle';
export type AssetCategory = AssetType | null;

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  roleOrDetails?: string;
  mapUrl?: string; // Google Maps link for locations
  imageUrl?: string; // Image URL for personnel
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'link' | 'image' | 'file';
}

export interface NodeData extends Record<string, unknown> {
  title: string;
  startTime: string;
  endTime: string;
  date?: string;
  assets: Asset[];
  color?: string;
  notes?: string; // In-node notes
  attachments?: Attachment[];
}

export interface EdgeData extends Record<string, unknown> {
  vehicle?: Asset;
}

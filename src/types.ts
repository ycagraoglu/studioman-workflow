export type AssetType = 'location' | 'personnel' | 'equipment';

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  roleOrDetails?: string;
}

export interface NodeData extends Record<string, unknown> {
  title: string;
  startTime: string;
  endTime: string;
  date?: string;
  assets: Asset[];
  color?: string;
}

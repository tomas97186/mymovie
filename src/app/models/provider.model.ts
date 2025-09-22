export interface ProviderModel {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
  type: ('rent' | 'flatrate' | 'buy')[]
}

export interface ProviderModelList {
  link: string;
  flatrate: ProviderModel[];
  rent: ProviderModel[];
  buy: ProviderModel[];
}

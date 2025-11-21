export type WantItem = {
  id?: string;
  title: string;
  url?: string;
  note?: string;
  desiredPrice?: number;
};

export type Offer = {
  vendor: string;
  price: number;
  currency?: string;
  affiliateUrl?: string;
  shipping?: number;
};

export type CompareResult = {
  item: WantItem;
  offers: Offer[];
};

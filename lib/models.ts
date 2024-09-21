declare global {
  type Discipline = {
    abbr: string;
    name: string;
  };

  type Bike = {
    id: string;
    name: string;
    strava_bike: string;
    discipline: Discipline;
  };

  type Session = {
    user: {
      name: string;
      email: string;
      image: string | null;
    };
    expires: string;
    accessToken: string;
    userId: string;
  };

  type Manufacturer = {
    id: string;
    name: string;
  };

  type SellStatus = {
    id: string;
    slug: string;
    name: string;
  };

  type PartsType = {
    id: string;
    name: string;
  };

  type Part = {
    id: string;
    buy_price: number;
    model_year: number;
    name: string;
    purchase_date: string;
    receipt: string | null;
    secondhand: boolean;
    sell_price: number | null;
    shop_url: string;
    updated_at: string | null;
    user_id: string;
    weight: number;
    manufacturer: Manufacturer;
    sell_status: SellStatus;
    parts_type: PartsType;
  };

  type InstalledPart = {
    id: string;
    part: Part;
    installed_at: string;
    uninstalled_at: string | null;
  };
}

export {};

declare global {
  type Discipline = {
    id: string;
    abbr: string;
    name: string;
  };

  type Category = {
    id: string;
    name: string;
  };

  type Bike = {
    id: string;
    name: string;
    strava_bike: string;
    discipline: Discipline;
    category_id: string;
    ebike: boolean;
    images: string;
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

  type PartStatus = {
    slug: string;
    name: string;
    available: boolean;
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
    part_status: PartStatus;
    parts_type: PartsType;
    installations: Installation[];
  };

  type Installation = {
    id: string;
    part: Part;
    installed_at: string;
    uninstalled_at: string | null;
    bike: Bike;
  };
}

export {};

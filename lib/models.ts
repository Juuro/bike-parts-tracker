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

  type ManufacturerType = {
    // Define properties for manufacturer if known
    // For example:
    // id: string;
    name: string;
  };

  type SellStatusType = {
    // Define properties for sell_status if known
    // For example:
    // id: string;
    // status: string;
    name: string;
  };

  type PartsTypeType = {
    // Define properties for parts_type if known
    // For example:
    // id: string;
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
    manufacturer: ManufacturerType;
    sell_status: SellStatusType;
    parts_type: PartsTypeType;
  };

  type InstalledPart = {
    id: string;
    part: Part;
    installed_at: string;
    uninstalled_at: string | null;
  };
}

export {};

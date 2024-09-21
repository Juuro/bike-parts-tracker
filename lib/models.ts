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
}

export {};

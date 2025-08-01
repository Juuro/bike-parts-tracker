// Strava API service for handling OAuth and data fetching
export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  profile_medium: string;
  profile: string;
  follower_count: number;
  friend_count: number;
  weight: number;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  gear_id?: string;
  average_speed: number;
  max_speed: number;
}

export interface StravaGear {
  id: string;
  name: string;
  nickname: string;
  resource_state: number;
  distance: number;
  brand_name: string;
  model_name: string;
  frame_type: number;
  description: string;
}

export class StravaAPI {
  private baseUrl = "https://www.strava.com/api/v3";

  constructor(private accessToken: string) {}

  // Check if access token is still valid
  async isTokenValid(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/athlete`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Error validating Strava token:", error);
      return false;
    }
  }

  // Refresh access token using refresh token
  static async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
  } | null> {
    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      return await response.json();
    } catch (error) {
      console.error("Error refreshing Strava token:", error);
      return null;
    }
  }

  // Get athlete profile
  async getAthlete(): Promise<StravaAthlete | null> {
    try {
      const response = await fetch(`${this.baseUrl}/athlete`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch athlete data");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching athlete data:", error);
      return null;
    }
  }

  // Get recent activities
  async getActivities(page = 1, perPage = 30): Promise<StravaActivity[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/athlete/activities?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  }

  // Get athlete's bikes (gear)
  async getBikes(): Promise<StravaGear[]> {
    try {
      const athlete = await this.getAthlete();
      if (!athlete) return [];

      // Get detailed athlete data which includes bikes
      const response = await fetch(`${this.baseUrl}/athlete`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch athlete bikes");
      }

      const detailedAthlete = await response.json();
      return detailedAthlete.bikes || [];
    } catch (error) {
      console.error("Error fetching bikes:", error);
      return [];
    }
  }

  // Get specific gear details
  async getGear(gearId: string): Promise<StravaGear | null> {
    try {
      const response = await fetch(`${this.baseUrl}/gear/${gearId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch gear details");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching gear details:", error);
      return null;
    }
  }
}

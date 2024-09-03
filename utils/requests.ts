const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;

const fetchBikes = async (setBikes) => {
  try {
    const response = await fetch("/api/bikes");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setBikes(data);
  } catch (error) {
    console.error("Error fetching bikes:", error);
  }
};

const fetchBike = async (id, setBike) => {
  try {
    const response = await fetch(`/api/bikes/${id}`);
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setBike(data[0]);
  } catch (error) {
    console.error("Error fetching bikes:", error);
  }
};

const fetchBikeParts = async (id, setBikeParts) => {
  try {
    const response = await fetch(`/api/bikes/${id}/installation`);
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setBikeParts(data);
  } catch (error) {
    console.error("Error fetching parts:", error);
  }
};

// const addBikeParts = async (id) => {
//   try {
//     const response = await fetch(`/api/bikes/${id}/addpart`);
//     console.log("RESPONSE: ", response);
//   } catch (error) {
//     console.error("Error adding parts:", error);
//   }
// };

export { fetchBikes, fetchBike, fetchBikeParts };

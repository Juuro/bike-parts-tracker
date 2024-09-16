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
    console.error("Error fetching bike:", error);
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

const fetchManufacturers = async (setManufacturers) => {
  try {
    const response = await fetch("/api/manufacturers");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setManufacturers(data);
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
  }
};

const fetchSellStatus = async (setSellStatus) => {
  try {
    const response = await fetch("/api/sell_status");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setSellStatus(data);
  } catch (error) {
    console.error("Error fetching sell status:", error);
  }
};

const fetchPartsType = async (setPartsType) => {
  try {
    const response = await fetch("/api/parts_type");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setPartsType(data);
  } catch (error) {
    console.error("Error fetching part types:", error);
  }
};

export {
  fetchBikes,
  fetchBike,
  fetchBikeParts,
  fetchManufacturers,
  fetchSellStatus,
  fetchPartsType,
};

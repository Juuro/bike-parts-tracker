const fetchManufacturers = async () => {
  try {
    const response = await fetch("/api/manufacturers");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
  }
};

const fetchPartStatus = async () => {
  try {
    const response = await fetch("/api/part_status");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sell status:", error);
  }
};

const fetchPartsType = async () => {
  try {
    const response = await fetch("/api/parts_type");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching part types:", error);
  }
};

export { fetchManufacturers, fetchPartStatus, fetchPartsType };

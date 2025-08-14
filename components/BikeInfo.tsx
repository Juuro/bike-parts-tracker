import {
  fetchBikeParts,
  fetchCategories,
  fetchUserProfile,
  fetchAvailableUnits,
} from "@/utils/requestsServer";
import {
  getCurrencySymbol,
  formatWeight,
  formatDistance,
} from "@/utils/profileUtils";
import {
  Calendar,
  DollarSign,
  Weight,
  Bike as BikeIcon,
  Zap,
  ExternalLink,
} from "lucide-react";

type BikeInfoProps = {
  bike: Bike;
  bikeId: string;
  categories?: Category[];
};

const BikeInfo: React.FC<BikeInfoProps> = async ({
  bike,
  bikeId,
  categories: categoriesProp = [],
}) => {
  // Fetch data in parallel
  const [bikeParts, categories, userProfile, availableUnits] =
    await Promise.all([
      fetchBikeParts(bikeId),
      categoriesProp.length > 0
        ? Promise.resolve(categoriesProp)
        : fetchCategories(),
      fetchUserProfile(),
      fetchAvailableUnits(),
    ]);

  const installedBikeParts = bikeParts.filter(
    (installation: Installation) => !installation.uninstalled_at
  );

  // Get user's preferred units with fallbacks
  const userCurrencyUnit = userProfile?.currency_unit || "USD";
  const userWeightUnit = userProfile?.weight_unit || "kg";
  const userDistanceUnit = userProfile?.distance_unit || "km";

  // Get unit symbols/labels from available units
  const currencySymbol =
    availableUnits.currency_unit.find((c: any) => c.unit === userCurrencyUnit)
      ?.symbol || getCurrencySymbol(userCurrencyUnit);

  // Calculate total purchase price from installed parts
  const calculateTotalPrice = () => {
    return installedBikeParts.reduce(
      (acc: number, installation: Installation) =>
        acc + (installation.part.buy_price || 0),
      0
    );
  };

  // Calculate total weight from installed parts (parts are stored in grams)
  const calculateTotalWeight = () => {
    const totalGrams = installedBikeParts.reduce(
      (acc: number, installation: Installation) =>
        acc + (installation.part.weight || 0),
      0
    );

    // Convert from grams to user's preferred unit
    let convertedWeight = totalGrams;
    if (userWeightUnit === "kg") {
      convertedWeight = totalGrams / 1000;
    } else if (userWeightUnit === "lbs") {
      convertedWeight = totalGrams / 453.592; // 1 lb = 453.592 grams
    }
    // 'g' stays as is

    return convertedWeight;
  };

  // Get bike type (discipline + category)
  const getBikeType = () => {
    const disciplineName = bike.discipline?.name || "Unknown";

    // Find category name by ID
    const category = categories.find((cat) => cat.id === bike.category_id);
    const categoryName = category?.name || "";

    if (categoryName && categoryName !== disciplineName) {
      return `${disciplineName} (${categoryName})`;
    }
    return disciplineName;
  };

  const totalPrice = calculateTotalPrice();
  const totalWeight = calculateTotalWeight();
  const bikeType = getBikeType();

  // Format values using user's preferred units
  const formattedPrice = `${currencySymbol}${totalPrice.toLocaleString()}`;
  const formattedWeight = formatWeight(totalWeight, userWeightUnit);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      style={{ height: "320px" }}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BikeIcon size={20} />
        Bike Information
      </h2>

      <div className="space-y-4">
        {/* Bike Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <BikeIcon size={16} />
            <span className="text-sm font-medium">Type</span>
          </div>
          <span className="text-sm text-gray-900 font-medium">{bikeType}</span>
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign size={16} />
            <span className="text-sm font-medium">Total Price</span>
          </div>
          <span className="text-sm text-gray-900 font-medium">
            {formattedPrice}
          </span>
        </div>

        {/* Total Weight */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Weight size={16} />
            <span className="text-sm font-medium">Weight</span>
          </div>
          <span className="text-sm text-gray-900">
            {totalWeight > 0
              ? formattedWeight
              : formatWeight(0, userWeightUnit)}
          </span>
        </div>

        {/* Distance - Placeholder for now */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Zap size={16} />
            <span className="text-sm font-medium">Distance</span>
          </div>
          <span className="text-sm text-gray-500 italic">
            Not tracked yet ({userDistanceUnit})
          </span>
        </div>

        {/* Strava Link */}
        {bike.strava_bike && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <ExternalLink size={16} />
              <span className="text-sm font-medium">Strava</span>
            </div>
            <a
              href={`https://www.strava.com/bikes/${bike.strava_bike}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              View on Strava
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Components: {installedBikeParts.length} installed</div>
        </div>
      </div>
    </div>
  );
};

export default BikeInfo;

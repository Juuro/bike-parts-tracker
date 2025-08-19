import Image from "next/image";
import { fetchBikeParts, fetchPartStatus } from "@/utils/requestsServer";
import DeletePartButton from "./DeletePartButton";
import DeleteInstallationButton from "./DeleteInstallationButton";
import { PackagePlus, History, Package, Wrench } from "lucide-react";
import insertInstallation from "@/app/actions/insertInstallation";
import EditPartModalModern from "./EditPartModalModern";
import Link from "next/link";

type InstallationsTableProps = {
  bikeId?: string;
  manufacturers?: Manufacturer[];
  partsType?: PartsType[];
  partStatus?: PartStatus[];
};

const InstallationsTable: React.FC<InstallationsTableProps> = async ({
  bikeId,
  manufacturers = [],
  partsType = [],
  partStatus: partStatusProp = [],
}) => {
  const bikeParts = await fetchBikeParts(bikeId);
  const partStatus =
    partStatusProp.length > 0 ? partStatusProp : await fetchPartStatus();

  const uninstalledBikeParts = bikeParts.filter(
    (installation: Installation) => installation.uninstalled_at
  );

  const installedBikeParts = bikeParts.filter(
    (installation: Installation) => !installation.uninstalled_at
  );

  const bikeNameOfCurrentInstallation = (installations: Installation[]) => {
    return installations.find(
      (installation: Installation) => !installation.uninstalled_at
    )?.bike.name;
  };

  const bikeIdOfCurrentInstallation = (installations: Installation[]) => {
    return installations.find(
      (installation: Installation) => !installation.uninstalled_at
    )?.bike.id;
  };

  const calculatePurchasePrice = () => {
    return installedBikeParts.reduce(
      (acc: number, installation: Installation) =>
        acc + installation.part.buy_price,
      0
    );
  };

  const calculateWeight = () => {
    return installedBikeParts.reduce(
      (acc: number, installation: Installation) =>
        acc + installation.part.weight,
      0
    );
  };

  const isPartCurrentlyInstalledOnThisBike = (partId: string) => {
    return installedBikeParts.some(
      (installation: Installation) => installation.part.id === partId
    );
  };

  const isPartCurrentlyInstalledOnAnyBike = (
    partId: string,
    installations: Installation[]
  ) => {
    return installations.find((installation: Installation) => {
      return installation.part.id === partId && !installation.uninstalled_at;
    })?.id;
  };

  const StatusBadge = ({ status }: { status: { name: string } }) => {
    const getStatusColor = (statusName: string) => {
      switch (statusName.toLowerCase()) {
        case "installed":
          return "bg-green-100 text-green-800 border-green-200";
        case "available":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "broken":
          return "bg-red-100 text-red-800 border-red-200";
        case "sold":
          return "bg-gray-100 text-gray-800 border-gray-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
          status.name
        )}`}
      >
        {status.name}
      </span>
    );
  };

  const MobilePartCard = ({
    installation,
    isHistory = false,
  }: {
    installation: Installation;
    isHistory?: boolean;
  }) => {
    const part = installation.part;

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Image
              src={`https://picsum.photos/40/40?random=${part.id}`}
              className="rounded-md ring-1 ring-gray-200 flex-shrink-0 w-10 h-10"
              width={40}
              height={40}
              alt={`${part.name} image`}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 text-sm truncate">
                {part.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {part.manufacturer.name} • {part.parts_type.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            {isHistory &&
              !isPartCurrentlyInstalledOnThisBike(part.id) &&
              part.part_status.available && (
                <form action={insertInstallation}>
                  <input
                    type="hidden"
                    name="current_installation_id"
                    value={isPartCurrentlyInstalledOnAnyBike(
                      part.id,
                      part.installations
                    )}
                  />
                  <input type="hidden" name="part_id" value={part.id} />
                  <input
                    type="hidden"
                    name="bike_id"
                    value={installation.bike.id}
                  />
                  <button
                    type="submit"
                    className="py-2 px-3 text-green-600 bg-transparent hover:bg-green-100 hover:text-green-800 rounded-lg text-sm inline-flex justify-center items-center transition-colors"
                    title={`Reassign part to ${installation.bike.name}`}
                  >
                    <PackagePlus size={18} />
                  </button>
                </form>
              )}
            <EditPartModalModern
              showCloseButton={true}
              part={part}
              manufacturers={manufacturers}
              partsType={partsType}
              partStatus={partStatus}
            />
            {isHistory ? (
              <DeletePartButton
                partStatus={partStatus}
                installationId={installation.id}
                partId={part.id}
              />
            ) : (
              <DeleteInstallationButton
                installationId={installation.id}
                bikeName={installation.bike.name}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-gray-900 font-medium">${part.buy_price}</span>
            <span className="text-gray-600">{part.weight}g</span>
            <StatusBadge status={part.part_status} />
          </div>

          {isHistory && installation.installed_at && (
            <span className="text-gray-500">
              {new Date(installation.installed_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {isHistory &&
          isPartCurrentlyInstalledOnAnyBike(part.id, part.installations) && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Currently on: </span>
              <Link
                href={`/bikes/${bikeIdOfCurrentInstallation(
                  part.installations
                )}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {bikeNameOfCurrentInstallation(part.installations)}
              </Link>
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Current Installations Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Wrench className="h-6 w-6 text-gray-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Current Setup
              </h2>
              <p className="text-sm text-gray-600">
                Parts currently installed on this bike
              </p>
            </div>
          </div>
        </div>

        {installedBikeParts.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Mobile View */}
            <div className="md:hidden p-4">
              {installedBikeParts.map((installation: Installation) => (
                <MobilePartCard
                  key={`${installation.part.id}-${installation.id}`}
                  installation={installation}
                />
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Part
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Weight
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {installedBikeParts.map((installation: Installation) => {
                    const part = installation.part;
                    return (
                      <tr
                        key={`${part.id}-${installation.id}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Image
                              src={`https://picsum.photos/40/40?random=${part.id}`}
                              className="rounded-lg ring-2 ring-gray-100 flex-shrink-0 w-10 h-10"
                              width={40}
                              height={40}
                              alt={`${part.name} image`}
                            />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {part.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {part.manufacturer.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {part.parts_type.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${part.buy_price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={part.part_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {part.weight}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <EditPartModalModern
                              showCloseButton={true}
                              part={part}
                              manufacturers={manufacturers}
                              partsType={partsType}
                              partStatus={partStatus}
                            />
                            <DeleteInstallationButton
                              installationId={installation.id}
                              bikeName={installation.bike.name}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-3 text-sm font-medium text-gray-900"
                    >
                      Totals
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      ${calculatePurchasePrice()}
                    </td>
                    <td className="px-6 py-3"></td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {calculateWeight()}g
                    </td>
                    <td className="px-6 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No parts installed
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by adding parts to this bike.
            </p>
          </div>
        )}
      </div>

      {/* Parts History Section */}
      {uninstalledBikeParts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <History className="h-6 w-6 text-gray-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Parts History
                </h2>
                <p className="text-sm text-gray-600">
                  Parts that were previously installed on this bike
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Mobile View */}
            <div className="md:hidden p-4">
              {uninstalledBikeParts.map((installation: Installation) => (
                <MobilePartCard
                  key={`${installation.part.id}-${installation.id}-history`}
                  installation={installation}
                  isHistory={true}
                />
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Part
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Installed Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Currently On
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uninstalledBikeParts.map((installation: Installation) => {
                    const part = installation.part;
                    return (
                      <tr
                        key={`${part.id}-${installation.id}-history`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Image
                              src={`https://picsum.photos/40/40?random=${part.id}`}
                              className="rounded-lg ring-2 ring-gray-100 flex-shrink-0 w-10 h-10"
                              width={40}
                              height={40}
                              alt={`${part.name} image`}
                            />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {part.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {part.manufacturer.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {part.parts_type.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {installation.installed_at
                            ? new Date(
                                installation.installed_at
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${part.buy_price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={part.part_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isPartCurrentlyInstalledOnAnyBike(
                            part.id,
                            part.installations
                          ) && (
                            <Link
                              href={`/bikes/${bikeIdOfCurrentInstallation(
                                part.installations
                              )}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {bikeNameOfCurrentInstallation(
                                part.installations
                              )}
                            </Link>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {!isPartCurrentlyInstalledOnThisBike(part.id) &&
                              part.part_status.available && (
                                <form action={insertInstallation}>
                                  <input
                                    type="hidden"
                                    name="current_installation_id"
                                    value={isPartCurrentlyInstalledOnAnyBike(
                                      part.id,
                                      part.installations
                                    )}
                                  />
                                  <input
                                    type="hidden"
                                    name="part_id"
                                    value={part.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="bike_id"
                                    value={installation.bike.id}
                                  />
                                  <button
                                    type="submit"
                                    className="py-2 px-3 text-green-600 bg-transparent hover:bg-green-100 hover:text-green-800 rounded-lg text-sm inline-flex justify-center items-center transition-colors"
                                    title={`Reassign part to ${installation.bike.name}`}
                                  >
                                    <PackagePlus size={18} />
                                  </button>
                                </form>
                              )}
                            <EditPartModalModern
                              showCloseButton={true}
                              part={part}
                              manufacturers={manufacturers}
                              partsType={partsType}
                              partStatus={partStatus}
                            />
                            <DeletePartButton
                              partStatus={partStatus}
                              installationId={installation.id}
                              partId={part.id}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallationsTable;

import Image from "next/image";
import { fetchBikeParts, fetchPartStatus } from "@/utils/requestsServer";
import DeletePartButton from "./DeletePartButton";
import DeleteInstallationButton from "./DeleteInstallationButton";
import { PackagePlus } from "lucide-react";
import insertInstallation from "@/app/actions/insertInstallation";
import EditPartModal from "./EditPartModal";
import Link from "next/link";

type InstallationsTableProps = {
  bikeId?: string;
};

const InstallationsTable: React.FC<InstallationsTableProps> = async ({
  bikeId,
}) => {
  const bikeParts = await fetchBikeParts(bikeId);
  const partStatus = await fetchPartStatus();

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

  return (
    <div className="flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 md:pt-0">
          {/* TODO: Mobile view */}
          <div className="md:hidden">
            {bikeParts?.map((installation: Installation) => {
              const part = installation.part;

              return (
                <div
                  key={part.id + installation.id}
                  className="mb-2 w-full rounded-md bg-white p-4"
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="mb-2 flex items-center">
                        <Image
                          src={`https://picsum.photos/28/28?random=${part.id}`}
                          className="mr-2 rounded-full"
                          width={28}
                          height={28}
                          alt={`${part.name}'s profile picture`}
                        />
                        <p>{part.name}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {part.purchase_date}
                      </p>
                    </div>
                    Status
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div>
                      <p className="text-xl font-medium">{part.buy_price}</p>
                      <p>{installation.installed_at}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      Update <br /> Delete
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              {/* TODO: measured weight */}
              <tr>
                <th scope="col" className="px-3 py-5 font-medium sm:pl-6">
                  Manufacturer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Model name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Type
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Purchase Price
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Weight
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Distance
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {installedBikeParts?.map((installation: Installation) => {
                const part: Part = installation.part;

                return (
                  <tr
                    key={part.id + installation.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={`https://picsum.photos/28/28?random=${part.id}`}
                          className="rounded-full"
                          width={28}
                          height={28}
                          alt={`${part.name}'s profile picture`}
                        />
                        <p>{part.manufacturer.name}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{part.name}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.parts_type.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.buy_price}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.part_status.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.weight}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">0</td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-1">
                        <DeleteInstallationButton
                          installationId={installation.id}
                          bikeName={installation.bike.name}
                        />
                        <EditPartModal showCloseButton={true} part={part} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={3}
                  className="pl-6 pr-3 py-3 text-sm font-medium"
                ></td>
                <td className="px-3 py-5 text-sm font-medium">
                  {calculatePurchasePrice()}
                </td>
                <td className="px-3 py-5 text-sm font-medium"></td>
                <td className="px-3 py-5 text-sm font-medium">
                  {calculateWeight()}
                </td>
                <td className="px-3 py-5 text-sm font-medium"></td>
                <td className="px-3 py-5 text-sm font-medium"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div className="inline-block min-w-full align-middle">
        <h2 className="mt-10 text-2xl font-bold">
          Parts that were installed on this bike before
        </h2>
        <div className="rounded-lg bg-gray-50 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-3 py-5 font-medium sm:pl-6">
                  Manufacturer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Model name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Type
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Installed on
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Purchase Price
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Weight
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Distance
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {uninstalledBikeParts?.map((installation: Installation) => {
                const part = installation.part;

                return (
                  <tr
                    key={part.id + installation.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={`https://picsum.photos/28/28?random=${part.id}`}
                          className="rounded-full"
                          width={28}
                          height={28}
                          alt={`${part.name}'s profile picture`}
                        />
                        <p>{part.manufacturer.name}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{part.name}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.parts_type.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {isPartCurrentlyInstalledOnAnyBike(
                        part.id,
                        part.installations
                      ) && (
                        <Link
                          href={`/bikes/${bikeIdOfCurrentInstallation(
                            part.installations
                          )}`}
                        >
                          {bikeNameOfCurrentInstallation(part.installations)}
                        </Link>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.buy_price}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.part_status.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.weight}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">0</td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-1">
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
                                className="py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                title={`Reassign part to ${installation.bike.name}`}
                              >
                                <PackagePlus color="#00ff00" />
                              </button>
                            </form>
                          )}
                        <EditPartModal showCloseButton={true} part={part} />
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
  );
};

export default InstallationsTable;

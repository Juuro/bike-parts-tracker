import Image from "next/image";
import { fetchBikes, fetchParts } from "@/utils/requestsServer";
import DeletePartButton from "./DeletePartButton";
import DeleteInstallationButton from "./DeleteInstallationButton";
import { Edit, PackagePlus } from "lucide-react";
import AssignPartButton from "./AssignPartButton";
import Link from "next/link";

type PartsTableProps = {
  bikeName?: string;
  bikeId?: string;
};

const PartsTable: React.FC<PartsTableProps> = async ({ bikeName, bikeId }) => {
  const bikeParts = await fetchParts();
  const bikes = await fetchBikes();

  const hasInstallationWhereUninstalledAtIsNull = (
    installations: Installation[]
  ) => {
    return installations.some(
      (installation: any) => !installation.uninstalled_at
    );
  };

  const installationIdOfCurrentInstallation = (
    installations: Installation[]
  ) => {
    return installations.find((installation) => !installation.uninstalled_at)
      ?.id;
  };

  const bikeNameOfCurrentInstallation = (installations: Installation[]) => {
    return installations.find((installation) => !installation.uninstalled_at)
      ?.bike.name;
  };

  const bikeIdOfCurrentInstallation = (installations: Installation[]) => {
    return installations.find((installation) => !installation.uninstalled_at)
      ?.bike.id;
  };

  return (
    <div className="flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 md:pt-0">
          <div className="md:hidden">
            {bikeParts?.map((part: Part) => {
              return (
                <div
                  key={part.id}
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
                      <p>{}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      Update <br /> Delete
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <table className="hidden mb-3 min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              {/* TODO: calculated weight, measured weight */}
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
                  On Sale
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {bikeParts?.map((part: Part) => {
                return (
                  <tr
                    key={part.id}
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
                      <Link
                        href={`/bikes/${bikeIdOfCurrentInstallation(
                          part.installations
                        )}`}
                      >
                        {bikeNameOfCurrentInstallation(part.installations)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.buy_price}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.part_status.name}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-1">
                        {hasInstallationWhereUninstalledAtIsNull(
                          part.installations
                        ) ? (
                          <DeleteInstallationButton
                            installationId={part.installations[0]?.id}
                            bikeName={part.installations[0]?.bike.name}
                          />
                        ) : (
                          part.part_status.available && (
                            <AssignPartButton
                              bikes={bikes}
                              partId={part.id}
                              titleText={`Assign part to a bike`}
                            />
                          )
                        )}
                        <button
                          className="py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                          type="button"
                          title="Edit this part"
                        >
                          <Edit />
                        </button>
                        <DeletePartButton
                          installationId={installationIdOfCurrentInstallation(
                            part.installations
                          )}
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

export default PartsTable;

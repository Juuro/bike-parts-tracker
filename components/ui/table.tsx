import Image from "next/image";
import { fetchBikeParts } from "@/utils/requests";
import DeletePartButton from "../DeletePartButton";
import DeleteInstallationButton from "../DeleteInstallationButton";
import { Edit } from "lucide-react";

type DeleteInstallationButtonProps = {
  bikeName: string;
  bikeId: string;
};

const PartsTable: React.FC<DeleteInstallationButtonProps> = async ({
  bikeName,
  bikeId,
}) => {
  const bikeParts = await fetchBikeParts(bikeId);

  return (
    <div className="flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 md:pt-0">
          <div className="md:hidden">
            {bikeParts?.map((installation: InstalledPart) => {
              const { part } = installation;

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
              {bikeParts?.map((installation: InstalledPart) => {
                const { part } = installation;

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
                    <td className="whitespace-nowrap px-3 py-3">{bikeName}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.buy_price}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {part.sell_status.name}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <button
                          className="py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                          type="button"
                          title="Edit this part"
                        >
                          <Edit />
                        </button>
                        <DeleteInstallationButton
                          installationId={installation.id}
                          bikeName={bikeName}
                        />
                        <DeletePartButton
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

export default PartsTable;

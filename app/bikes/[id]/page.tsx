import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/Modal";
import { fetchBike, fetchBikeParts } from "@/utils/requests";
import deletePart from "@/app/actions/deletePart";
import deleteInstallation from "@/app/actions/deleteInstallation";
import { auth } from "@/auth";

const BikePage = async ({ params }) => {
  const { id } = params;
  // const { data: session, status } = useSession();
  // const [bike, setBike] = useState();
  // const [bikeParts, setBikeParts] = useState([]);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const router = useRouter();
  let isModalOpen = false;

  const session = await auth();

  // let bike: Bike;
  // let bikeParts: InstalledPart;
  // if (session) {
  const bike = await fetchBike(id);
  console.log("bike ", bike);
  const bikeParts = await fetchBikeParts(id);
  // }

  const openModal = () => (isModalOpen = true);
  const closeModal = (event: Event) => {
    if (event?.key === "Escape" || event.target === event.currentTarget) {
      isModalOpen = false;
    }
  };

  const handleDeletePart = async (installationId: string, partId: string) => {
    await deletePart(installationId, partId);
    // TODO: Ungeil.
    // window.location.reload();
    // router.refresh();
  };

  const handleDeleteInstallation = async (installationId: string) => {
    await deleteInstallation(installationId);
    // TODO: Ungeil.
    // window.location.reload();
    // router.refresh();
  };

  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">{bike.name}</h1>
        {/* calculated weight, measured weight */}
        <ul>
          {bikeParts.length == 0 ? (
            <p>No parts found</p>
          ) : (
            bikeParts.map((installation: InstalledPart) => {
              const { part } = installation;

              return (
                <li key={installation.id}>
                  {part.parts_type.name}: {part.manufacturer.name} {part.name} (
                  {part.model_year})<br />
                  {part.weight} g<br />
                  {part.secondhand === false ? <>🆕</> : <></>} {part.buy_price}{" "}
                  € <Link href={part.shop_url}>{part.shop_url}</Link>
                  <br />
                  Installed: {installation.installed_at}
                  <br />
                  {installation.uninstalled_at !== null ? (
                    <>
                      {installation.uninstalled_at}
                      <br />
                    </>
                  ) : (
                    <></>
                  )}
                  {part.sell_status.name}
                  {/* <button
                    onClick={() => handleDeletePart(installation.id, part.id)}
                    className="mx-5 py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    type="button"
                  >
                    Delete Part
                  </button>
                  <button
                    onClick={() => handleDeleteInstallation(installation.id)}
                    className="mx-5 py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    type="button"
                  >
                    Remove Part From Bike
                  </button> */}
                </li>
              );
            })
          )}
        </ul>
        {/* AddPartsForm component */}
        {/* <button
          onClick={openModal}
          className="my-5 text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          type="button"
        >
          <svg
            className="me-1 -ms-1 w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            ></path>
          </svg>
          Add new part
        </button> */}
        {/* <Modal
          isOpen={isModalOpen}
          onOpen={closeModal}
          onClose={closeModal}
          title="Add part"
          showCloseButton
          bike={bike}
        >
          <p>This is the content inside the modal.</p>
        </Modal> */}
      </div>
    </section>
  );
};

export default BikePage;

"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchBike, fetchBikeParts } from "@/utils/requests";
import Link from "next/link";
import Modal from "@/components/Modal";

export default function BikePage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [bike, setBike] = useState();
  const [bikeParts, setBikeParts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = (event: Event) => {
    if (event?.key === "Escape" || event.target === event.currentTarget) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchBike(id, setBike);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBikeParts(id, setBikeParts);
    }
  }, [status, isModalOpen]);

  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">{bike?.name}</h1>
        {/* calculated weight, measured weight */}
        <ul>
          {bikeParts.length == 0 ? (
            <p>No parts found</p>
          ) : (
            bikeParts.map((installation) => {
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
                  <button
                    className="mx-5 py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    type="button"
                  >
                    Delete
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {/* AddPartsForm component */}
        <button
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
        </button>

        <Modal
          isOpen={isModalOpen}
          onOpen={closeModal}
          onClose={closeModal}
          title="Add part"
          showCloseButton
          bike={bike}
        >
          <p>This is the content inside the modal.</p>
        </Modal>
      </div>
    </section>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchBike, fetchBikeParts } from "@/utils/requests";
import addInstallation from "@/app/actions/addInstallation";
import Link from "next/link";

export default function BikePage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [bike, setBike] = useState();
  const [bikeParts, setBikeParts] = useState([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBike(id, setBike);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBikeParts(id, setBikeParts);
    }
  }, [status]);

  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">{bike?.name}</h1>
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
                </li>
              );
            })
          )}
        </ul>

        {/* AddPartsForm component */}
        <form action={addInstallation}>
          <input type="text" name="" />
          <select>
            <option>Type</option>
            <option>Frame</option>
          </select>
          <button className="rounded-md bg-pink-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Add part ...
          </button>
        </form>
      </div>
    </section>
  );
}

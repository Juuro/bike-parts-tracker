import Link from "next/link";
import { fetchBike, fetchBikeParts } from "@/utils/requests";
import DeletePartButton from "@/components/DeletePartButton";
import DeleteInstallationButton from "@/components/DeleteInstallationButton";
import AddPartModal from "@/components/AddPartModal";

const BikePage = async ({ params }) => {
  const { id } = params;

  const bike = await fetchBike(id);
  const bikeParts = await fetchBikeParts(id);

  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">{bike.name}</h1>
        {/* TODO: calculated weight, measured weight */}
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
                  <DeletePartButton
                    installationId={installation.id}
                    partId={part.id}
                  />
                  <DeleteInstallationButton installationId={installation.id} />
                </li>
              );
            })
          )}
        </ul>
        <AddPartModal showCloseButton={true} bike={bike} />
      </div>
    </section>
  );
};

export default BikePage;

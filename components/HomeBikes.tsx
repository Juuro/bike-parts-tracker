import { auth } from "@/auth";
import { fetchBikes } from "@/utils/requestsServer";
import React from "react";
import Card from "./Card";
import BikeCard from "@/components/BikeCard";
import AddBikeModal from "./AddBikeModal";
import { Bike, Plus, ArrowRight } from "lucide-react";

const HomeBikes = async () => {
  const session = await auth();

  let bikes: Bike[] = [];
  if (session) {
    bikes = await fetchBikes();
  }

  if (bikes.length === 0) {
    return (
      <section>
        <h2 className="text-2xl mb-6">Your Bike Collection</h2>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center border border-blue-200">
          <div className="max-w-md mx-auto">
            {/* Icon */}
            <div className="bg-blue-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg">
              <Bike className="w-12 h-12 text-white" />
            </div>

            {/* Heading */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Start Your Bike Journey
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Add your first bike to begin tracking components, maintenance
              schedules, and keep your cycling gear organized like never before.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 gap-3 mb-8 text-sm">
              <div className="flex items-center justify-center text-gray-700">
                <div className="bg-green-100 p-1 rounded-full mr-2">
                  <ArrowRight className="w-3 h-3 text-green-600" />
                </div>
                Track every component and upgrade
              </div>
              <div className="flex items-center justify-center text-gray-700">
                <div className="bg-green-100 p-1 rounded-full mr-2">
                  <ArrowRight className="w-3 h-3 text-green-600" />
                </div>
                Never miss maintenance schedules
              </div>
              <div className="flex items-center justify-center text-gray-700">
                <div className="bg-green-100 p-1 rounded-full mr-2">
                  <ArrowRight className="w-3 h-3 text-green-600" />
                </div>
                Monitor performance and history
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-3">
              <AddBikeModal
                showCloseButton={true}
                buttonText="Add Your First Bike"
                buttonClassName="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 w-full"
              />
              <p className="text-xs text-gray-500">
                It only takes a minute to get started
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Your Bike Collection</h2>
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-6 border border-blue-100/50 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bikes.map((bike) => (
            <div key={bike.id} className="group">
              <BikeCard bike={bike} />
            </div>
          ))}

          {/* Enhanced Add Bike Card */}
          <div className="group cursor-pointer">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-400 transition-all duration-200 hover:shadow-md group-hover:scale-105 transform">
              <div className="aspect-[3/2] relative flex flex-col items-center justify-center p-6">
                <AddBikeModal
                  showCloseButton={true}
                  buttonText="Add Another Bike"
                  buttonClassName="flex flex-col items-center justify-center space-y-3 text-blue-700 font-semibold hover:text-blue-800 transition-colors duration-200 w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="mt-6 pt-4 border-t border-blue-100">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-semibold text-blue-700">{bikes.length}</span>{" "}
            bike{bikes.length !== 1 ? "s" : ""} in your collection
          </p>
        </div>
      </div>
    </section>
  );
};

export default HomeBikes;

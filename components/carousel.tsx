"use client";

import { useState } from "react";
import Image from "next/image";
import { CircleArrowLeft, CircleArrowRight } from "lucide-react";

type CarouselProps = {
  slides: string[];
};

const Carousel: React.FC<CarouselProps> = ({ slides }: CarouselProps) => {
  let [current, setCurrent] = useState(0);

  console.log("slides", slides);

  let previousSlide = () => {
    if (current === 0) setCurrent(slides.length - 1);
    else setCurrent(current - 1);
  };

  let nextSlide = () => {
    if (current === slides.length - 1) setCurrent(0);
    else setCurrent(current + 1);
  };

  return (
    <div className="overflow-hidden relative">
      <div
        className={`flex transition ease-out duration-40`}
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {slides.map((image: string, index: number) => {
          return (
            <Image
              src={image}
              key={index}
              className="min-w-full"
              width={3000}
              height={1000}
              alt=""
            />
          );
        })}
      </div>

      <div className="absolute top-0 h-full w-full justify-between items-center flex text-white px-10 text-3xl">
        <button onClick={previousSlide}>
          <CircleArrowLeft />
        </button>
        <button onClick={nextSlide}>
          <CircleArrowRight />
        </button>
      </div>

      <div className="absolute bottom-0 py-4 flex justify-center gap-3 w-full">
        {slides.map((s, i) => {
          return (
            <div
              onClick={() => {
                setCurrent(i);
              }}
              key={"circle" + i}
              className={`rounded-full w-5 h-5 cursor-pointer  ${
                i == current ? "bg-white" : "bg-gray-500"
              }`}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;

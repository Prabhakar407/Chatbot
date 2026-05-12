import React, { useState, useMemo } from "react";

const getRandomPrice = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default function ImageSlider({ images, type }) {

  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  if (!images || images.length === 0) return null;

  const prices = useMemo(() =>
    images.map(() =>
      type === "shoes"
        ? getRandomPrice(1299, 2999)
        : getRandomPrice(299, 699)
    ), []
  );

  const handlePrev = () => {
    setCurrent((prev) => Math.max(prev - 2, 0));
    setAnimKey((k) => k + 1);
  };

  const handleNext = () => {
    setCurrent((prev) => prev + 2 < images.length ? prev + 2 : prev);
    setAnimKey((k) => k + 1);
  };

  const isFirstSlide = current === 0;
  const isLastSlide = current + 2 >= images.length;
  const visibleImages = images.slice(current, current + 2);

  return (
    <div className="w-full mt-2">

      <div className="flex items-center gap-1">

        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          disabled={isFirstSlide}
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold"
          style={{
            background: isFirstSlide ? "#E5E7EB" : "#6E1C1C",
            color: isFirstSlide ? "#9CA3AF" : "white",
          }}
        >
          ‹
        </button>

        {/* Images */}
        <div className="flex gap-2 flex-1">
          {visibleImages.map((item, i) => {
            const index = current + i;

            return (
              <div
                key={`${animKey}-${index}`}
                className={`flex-1 ${
                  i === 0 ? "animate-img-appear" : "animate-img-slide-delayed"
                }`}
              >
                {/* Image */}
                <div className="h-24 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={item.src}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* ✅ NAME + PRICE */}
                <div className="mt-1 text-center">

                  <p className="text-[11px] font-medium text-gray-800">
                    {item.name}
                  </p>

                  <span className="text-[11px] font-semibold text-[#6E1C1C]">
                    ₹{prices[index].toLocaleString("en-IN")}
                  </span>

                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          disabled={isLastSlide}
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold"
          style={{
            background: isLastSlide ? "#E5E7EB" : "#6E1C1C",
            color: isLastSlide ? "#9CA3AF" : "white",
          }}
        >
          ›
        </button>

      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1 mt-2">
        {Array.from({ length: Math.ceil(images.length / 2) }).map((_, i) => (
          <div
            key={i}
            className="rounded-full h-1.5"
            style={{
              width: i === Math.floor(current / 2) ? "12px" : "6px",
              background: i === Math.floor(current / 2) ? "#6E1C1C" : "#D1D5DB",
            }}
          />
        ))}
      </div>

    </div>
  );
}
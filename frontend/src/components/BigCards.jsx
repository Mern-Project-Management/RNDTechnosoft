import React from "react";
import { IoStarSharp, IoStarOutline, IoStarHalfSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

// RatingStars component to display star ratings
const RatingStars = ({ rating }) => {
  const totalStars = 5;
  const stars = [];

  for (let i = 0; i < totalStars; i++) {
    if (i < Math.floor(rating)) {
      stars.push(<IoStarSharp key={i} className="w-5 h-5" />);
    } else if (i < rating) {
      stars.push(<IoStarHalfSharp key={i} className="w-5 h-5" />);
    } else {
      stars.push(<IoStarOutline key={i} className="w-5 h-5" />);
    }
  }

  return <div className="flex text-yellow-500">{stars}</div>;
};

// Helper to get correct image source whether it is an external URL or local file
const getImageSrc = (photo) => {
  if (!photo) return '';
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  return `/api/image/download/${photo}`;
};

const TrustedSection = ({ homecard1, homecard2 }) => {
  if (!homecard1?.length || !homecard2?.length) return null;

  // Extract first homecard1 and homecard2 objects
  const firstCard = homecard1[0];
  const secondCard = homecard2[0];

  return (
    <div className=" mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 xl:px-20 xl:mx-12 pt-8 md:pt-12 lg:pt-16">
      <div className="flex flex-col lg:flex-row justify-center gap-6 md:gap-8">
        {/* First Card */}
        {firstCard && (
          <div className="relative rounded-lg w-full bg-[#134c6c] p-4 sm:p-6 md:p-8 flex flex-col text-white shadow-lg">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
              <div className="flex-1 space-y-4">
                <h3
                  className="text-lg sm:text-xl md:text-2xl lg:text-2xl  font-bold"
                  dangerouslySetInnerHTML={{ __html: firstCard.heading }}
                />
                <p
                  className="text-base sm:text-lg w-full md:w-[60%]  lg:max-w-sm max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: firstCard.description }}
                />
                <Link
                  to="/portfolios"
                  className="bg-yellow-500 text-white px-4 py-2 rounded transition duration-300 inline-block hover:bg-yellow-600"
                >
                  Explore Now
                </Link>
              </div>
              {firstCard.photo?.[0] && (
                <img
                  src={getImageSrc(firstCard.photo[0])}
                  alt={firstCard.photoAlt?.[0] || "company logos"}
                  loading="lazy"
                  className="w-32 sm:w-40 md:w-48 h-auto sm:absolute sm:top-0 sm:right-0 sm:-translate-y-4 sm:translate-x-4"
                />
              )}
            </div>
          </div>
        )}

        {/* Second Card */}
        {secondCard && (
          <div className="relative rounded-lg w-full bg-[#114038] p-4 sm:p-6 md:p-8 flex flex-col text-white shadow-lg">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
              <div className="flex-1 space-y-4">
                <h3
                  className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold"
                  dangerouslySetInnerHTML={{ __html: secondCard.heading }}
                />
                <p
                  className="text-base sm:text-lg w-full md:w-[60%] lg:max-w-sm max-w-xl"
                  dangerouslySetInnerHTML={{ __html: secondCard.description }}
                />
                <Link
                  to="/all-reviews"
                  className="bg-yellow-500 text-white px-4 py-2 rounded transition duration-300 inline-block hover:bg-yellow-600"
                >
                  View Testimonials
                </Link>
              </div>
              {secondCard.photo?.[0] && (
                <img
                  src={getImageSrc(secondCard.photo[0])}
                  alt={secondCard.photoAlt?.[0] || "reviews"}
                  loading="lazy"
                  className="w-32 sm:w-40 md:w-44 h-auto sm:absolute sm:top-0 sm:right-0 sm:-translate-y-4 sm:translate-x-4"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrustedSection;

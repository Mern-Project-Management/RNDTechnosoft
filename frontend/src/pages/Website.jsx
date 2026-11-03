import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../components/Websites/HeroSection";
import Review from "../components/Websites/Review";
import CraftLeft from "../components/Websites/CraftLeft";
import CraftRight from "../components/Websites/CraftRight";
import LatestProduct from "../components/Websites/LatestProduct";
import WhyPartnerWithUs from "../components/Websites/WhyPatnerUs";
import FAQ from "../components/Faq";
import BookAcall from "../components/BookAcall";
import De from "../components/Websites/De";
import PricingSection from "../components/Websites/Packages";
import LatestBlog from "../components/LatestBlog";
import WeAreExpert from "../components/WeAreExpert";
import Logotypes from "../components/Websites/Logotype";
import Tagline from "../components/Websites/Tagline";
import ServiceSlider from "../components/Websites/ServiceSlider";
import { useGetCombinedDataQuery } from "../redux/slices/homepageSlice";
import { useDispatch } from "react-redux";
import Companies from "../components/Design/companies";
import HexGridDemo from "../components/hexagon/Grid";
import GoogleReviewsWidget from "../components/GoogleReviews";

export default function Website() {
  const dispatch = useDispatch();
  const location = useLocation();

  // Fetch data using RTK Query
  const { data, isLoading, isError, error } = useGetCombinedDataQuery();

  useEffect(() => {
    if (data?.navigation) {
      dispatch(setNavData(data.navigation)); // Save navigation data to Redux
    }
  }, [data, dispatch]);

  // Extract slug from the URL
  const slug = location.pathname.split("/").filter(Boolean).pop();
  const comingSoonSlugs = [];

  // Check if the current slug is in the comingSoonSlugs array
  if (comingSoonSlugs.includes(slug)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center text-white">
        <div className="text-center space-y-6 p-6 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold">Coming Soon</h1>
          <p className="text-lg md:text-xl text-gray-300">
            We&apos;re working hard to bring you exciting content for{" "}
            <span className="font-semibold capitalize">{slug.replace("-", " ")}</span>.
            Stay tuned for updates!
          </p>
          <p className="text-md text-gray-400">
            In the meantime, feel free to explore our other services or contact us for more information.
          </p>
          <a
            href="/contact"
            className="inline-block bg-yellow-500 text-white px-6 py-3 rounded-full font-medium hover:bg-yellow-600 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeroSection />
      {/* <LatestProduct /> */}
      <CraftRight />
      <CraftLeft />
      {/* <ServiceSlider /> */}
      <div className="mt-10">
        <Tagline />
      </div>
      {/* <HexGridDemo expertData={data?.WeAreExpert} /> */}
      {/* <Logotypes /> */}
      <Companies />
      <De />
      <WhyPartnerWithUs />
     
      {/* <PricingSection /> */}
      {/* <DesignProcess /> */}
      <div className="mt-12">
        <FAQ />
      </div>
      <GoogleReviewsWidget />
      <LatestBlog />
    </div>
  );
}

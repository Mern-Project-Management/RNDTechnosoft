"use client";

import { useState, useEffect } from "react";
import Card from "./Card";

export default function GridLayout({ serviceData }) {
  console.log(serviceData)
  const [isMounted, setIsMounted] = useState(false);
  const [cardConfigs, setCardConfigs] = useState([]);

  useEffect(() => {
    setIsMounted(true);

    const updateCardConfigs = () => {
      if (window.matchMedia("(min-width: 1025px)").matches) {
        // Large screens (1025px and above)
        setCardConfigs([
          { colSpan: 2, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 2, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 2, justifySelf: "start" },
          { colSpan: 2, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 3, rowSpan: 1, justifySelf: "auto" },
        ]);
      } else if (window.matchMedia("(min-width: 768px)").matches) {
        // Medium screens (768px to 1024px)
        setCardConfigs([
          { colSpan: 2, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 2, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 2, rowSpan: 1, justifySelf: "auto" },
        ]);
      } else {
        // Small screens (below 768px)
        setCardConfigs([
          { colSpan: 1, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 1, justifySelf: "auto" },
          { colSpan: 1, rowSpan: 1, justifySelf: "auto" },
        ]);
      }
    };

    updateCardConfigs(); // Initial call
    window.addEventListener("resize", updateCardConfigs); // Update on resize

    return () => window.removeEventListener("resize", updateCardConfigs); // Cleanup
  }, []);

  if (!isMounted) {
    return null;
  }

  // Static data for AI/ML and Product Engineering
  const staticServices = [
    {
      _id: "static-aiml",
      category: "AI/ML",
      description: "We deliver AI/ML as a comprehensive service, providing end-to-end solutions from data preprocessing and model development to deployment and ongoing optimization. Our managed AI services eliminate the complexity of infrastructure management, allowing businesses to focus on leveraging intelligent insights rather than technical implementation. Through our cloud-based ML platform, we offer scalable artificial intelligence capabilities that can be seamlessly integrated into existing workflows and systems. Our expert team provides continuous model monitoring, performance tuning, and updates to ensure your AI solutions evolve with your business needs.",
      photo: "photo_1749723519420.webp",
      tag: "AI/ML",
      slug: "ai-ml",
    },
    {
      _id: "static-product-engineering",
      category: "Product Engineering",
      description: "We provide comprehensive end-to-end product development services that transform your innovative ideas into market-ready solutions. Our product engineering approach encompasses the entire development lifecycle, from initial concept validation and technical architecture design to full-scale deployment and post-launch optimization. Our experienced engineering teams specialize in building scalable, robust, and future-proof products using cutting-edge technologies and industry best practices. We focus on creating solutions that not only meet your current business requirements but also adapt and grow with your evolving needs. Through agile methodologies, continuous integration, and rigorous quality assurance, we ensure your product launches successfully while maintaining the flexibility to iterate and improve based on user feedback and market demands",
      photo: "photo_1749723695295.webp",
      tag: "Product Engineering",
      slug: "product-engineering",
    },
  ];

  // Define desired services order
  const desiredServices = [
    "UI/UX",
    "Software Development",
    "Web Development",
    "Mobile App Development",
    "AI/ML",
    "Product Engineering",
  ];

  // Normalize category names
  const normalizeCategory = (category) => {
    if (!category) return "";
    return category
      .trim()
      .replace("UI/UX", "UI/UX")
      .replace("Web Development", "Web Development")
      .replace("Custom Software", "Software Development")
      .replace(/\s+/g, " ");
  };

  // Filter dynamic services to include only desired services (excluding AI/ML and Product Engineering for now)
  const dynamicServices = Array.isArray(serviceData)
    ? serviceData.filter((service) =>
        desiredServices
          .filter((cat) => cat !== "AI/ML" && cat !== "Product Engineering")
          .includes(normalizeCategory(service.category))
      )
    : [];

  // Combine dynamic and static services, prioritizing dynamic data
  const allServices = desiredServices
    .map((category) => {
      const dynamicService = dynamicServices.find(
        (service) => normalizeCategory(service.category) === category
      );
      if (dynamicService) return dynamicService;
      return staticServices.find(
        (service) => normalizeCategory(service.category) === category
      );
    })
    .filter((service) => service !== undefined) // Remove undefined entries
    .sort((a, b) => {
      const categoryA = normalizeCategory(a.category);
      const categoryB = normalizeCategory(b.category);
      const indexA = desiredServices.indexOf(categoryA);
      const indexB = desiredServices.indexOf(categoryB);
      return indexA - indexB;
    });

  if (allServices.length === 0) {
    return <div>No service data available</div>;
  }

  const cardColors = [
    "#396C89",
    "#6E777F",
    "#C59B34",
    "#60456E",
    "#EFC27B",
    "#482620",
  ];

  const imageClasses = [
    "object-contain w-full h-32",
    "rounded-lg shadow-md",
    "aspect-square object-cover",
    "h-24 w-24 mx-auto",
    "object-center rounded-xl",
    "w-full h-auto",
  ];

  return (
    <>
      <div>
        <h2 className="text-4xl md:text-5xl mt-1 font-serif text-center font-medium">
          Our <span className="text-yellow-500">Services</span>
        </h2>
        <h3 className="md:text-[23px] text-center text-gray-700 pb-16 mt-4">
          Dedicated to Your Success
        </h3>
      </div>
      <div className="sm:grid flex flex-col px-4 w-full overflow-hidden max-w-[82rem] 2xl:max-w-[85rem] xl:max-w-[76rem] mx-auto gap-4 xl:grid-cols-4 grid-rows-[repeat(3,minmax(200px,auto))]">
        {allServices.map((service, index) => (
          <Card
            key={service._id}
            id={index + 1}
            title={service.category}
            color={cardColors[index % cardColors.length]}
            description={
              service.description
                ? service.description.replace(/<\/?[^>]+(>|$)/g, "")
                : `Service information for ${service.category}`
            }
            className={`col-span-${cardConfigs[index]?.colSpan || 1} row-span-${
              cardConfigs[index]?.rowSpan || 1
            } justify-self-${cardConfigs[index]?.justifySelf || "auto"}`}
            colSpan={cardConfigs[index]?.colSpan || 1}
            rowSpan={cardConfigs[index]?.rowSpan || 1}
            imageUrl={service.photo ? `/api/logo/download/${service.photo}` : null}
            imageClassName={imageClasses[index % imageClasses.length]}
            tag={service.tag || service.category}
            slug={service.slug}
            index={index}
          />
        ))}
      </div>
    </>
  );
}
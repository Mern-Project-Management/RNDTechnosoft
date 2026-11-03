import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { gsap } from "gsap";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [openIndex, setOpenIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const answerRefs = useRef([]);
  const { slug } = useParams();

  useEffect(() => {
    // Fetch FAQ data
    const fetchFAQData = async () => {
      try {
        const response = await axios.get(
          `/api/faq/getFAQByServiceSlug${slug ? `?slug=${slug}` : ""}`
        );
        const data = response.data.data || [];
        setFaqs(data);
        if (data.length > 0) {
          setOpenIndex(0);
        }
      } catch (error) {
        console.error("Error fetching FAQ data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQData();

    // Fetch page heading and subheading
    axios
      .get("/api/pageHeading/heading?pageType=faq")
      .then((response) => {
        setHeading(response.data.heading);
        setSubheading(response.data.subheading);
      })
      .catch((error) => {
        console.error("Error fetching page heading data:", error);
      });
  }, [slug, location.pathname]);

  useEffect(() => {
    if (openIndex !== null && answerRefs.current[openIndex]) {
      gsap.fromTo(
        answerRefs.current[openIndex],
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power1.out" }
      );
    }
  }, [openIndex, faqs]);

 const toggleFAQ = (index) => {
  if (openIndex === index) {
    // Close the same item
    gsap.to(answerRefs.current[openIndex], {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power1.inOut",
      onComplete: () => setOpenIndex(null),
    });
  } else {
    if (openIndex !== null) {
      // Close previous before opening new
      gsap.to(answerRefs.current[openIndex], {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power1.inOut",
        onComplete: () => setOpenIndex(index),
      });
    } else {
      // No previous, just open new
      setOpenIndex(index);
    }
  }
};

  if (faqs.length === 0) {
    return null;
  }

  return (
<div className="w-full mb-16 max-w-[83rem] 2xl:px-0 xl:px-[4.5rem] lg:px-9 md:px-5 px-5 mx-auto">
  <h2 className="text-3xl sm:text-4xl lg:text-5xl text-center font-serif">
    {heading}
  </h2>
  <h3 className="md:text-[23px] text-center pb-16 mt-4 text-gray-700">
    {subheading}
  </h3>
  {faqs.map((faq, index) => (
    <div key={faq._id} className="mb-4">
      <div
        className="flex justify-between items-center px-4 sm:px-6 lg:px-8 bg-[#f9f7f1] rounded-[20px] py-4 cursor-pointer"
        onClick={() => toggleFAQ(index)}
      >
        <h3 className="text-base sm:text-lg lg:text-xl font-medium font-inter">
          {faq.question}
        </h3>
        <span className="text-lg sm:text-xl lg:text-2xl">
          {openIndex === index ? <FaMinus /> : <FaPlus />}
        </span>
      </div>
      <div
        ref={(el) => (answerRefs.current[index] = el)}
        className={`overflow-hidden ${
          openIndex === index ? "block" : "hidden"
        }`}
      >
        <div
          className="p-4 sm:p-5 lg:p-6 font-inter text-sm sm:text-base text-justify"
          dangerouslySetInnerHTML={{ __html: faq.answer }}
        />
      </div>
    </div>
  ))}
</div>

  );
};

export default FAQ;

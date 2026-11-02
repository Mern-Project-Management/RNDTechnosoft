import React, { useState, useEffect } from 'react';

const getMediaUrl = (photo) => {
  if (!photo) return '';
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  return `/api/image/download/${photo}`;
};

const isVideoFile = (filename) => {
  if (!filename) return false;
  const cleanUrl = filename.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.includes('ik-video') ||
    cleanUrl.includes('.webm') ||
    cleanUrl.includes('.mp4')
  );
};

export default function WhatYouGet({ everyPlan }) {
  const [plans, setPlans] = useState([]);
  const [heading, setHeading] = useState('');

  useEffect(() => {
    if (everyPlan?.length > 0) {
      const planData = everyPlan[0];
      setHeading(planData.heading);

      if (planData.subsections && planData.subsections.length > 0) {
        setPlans(planData.subsections);
      }
    }
  }, [everyPlan]);

  if (plans.length === 0) {
    return null;
  }

  return (
    <div className='relative pt-28 pb-16'>
      <div className="relative">
        <div className="relative mx-auto px-6 z-10">
          <h2
            className="text-4xl md:text-5xl font-serif text-center mb-16"
            dangerouslySetInnerHTML={{ __html: heading }}
          ></h2>
          <div className='max-w-7xl mx-auto'>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, index) => {
                const mediaUrl = getMediaUrl(plan.photo);
                const isVideo = isVideoFile(plan.photo);

                return (
                  <li key={index} className="flex flex-col items-center text-center">
                    {mediaUrl ? (
                      isVideo ? (
                        <video
                          src={mediaUrl}
                          muted
                          autoPlay
                          loop
                          playsInline
                          preload="auto"
                          className="mb-6 lg:w-24 lg:h-24 w-28 h-28 object-contain"
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={plan.photoAlt || plan.title || "Plan Icon"}
                          className="mb-6 lg:w-24 lg:h-24 w-28 h-28 object-contain"
                        />
                      )
                    ) : (
                      <div className="mb-6 lg:w-24 lg:h-24 w-28 h-28" />
                    )}
                    <h3 className="text-xl font-semibold pb-3">{plan.title}</h3>
                    <p dangerouslySetInnerHTML={{ __html: plan.description }}></p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

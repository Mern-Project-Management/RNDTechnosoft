import React, { useState, useEffect } from 'react';
import axios from 'axios';
import bg from "../../images/Rectangle2.png"

const ValuesSection = () => {
    const [values, setValues] = useState([]);
    const [heading, setHeading] = useState('Our Values');
    const [subHeading, setSubHeading] = useState('This is the foundation for our value statement, and our commitment at RND Technosoft is inspired by the following core values. Here\'s what sets us apart:');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/corevalue/getActiveCorevalues`, {
                    withCredentials: true,
                });
                console.log(response.data.data)
                const activeValues = response.data.data.filter(value => value.status === 'active');
                setValues(activeValues); // Set the array of values
            } catch (error) {
                console.error("Error fetching core values:", error);
            }
        };

        const fetchHeadings = async () => {
            try {
                const response = await axios.get('/api/pageHeading/heading?pageType=corevalue', { withCredentials: true });
                const { heading, subheading } = response.data;
                setHeading(heading || 'Our Values');
                setSubHeading(subheading || 'This is the foundation for our value statement, and our commitment at [YOUR COMPANY] is inspired by the following core values. Here\'s what sets us apart:');
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
        fetchHeadings();
    }, []);

    return ( 
        <div className="py-12 pb-24 px-4 sm:px-6 mt-10 mb-16 lg:px-8 w-full relative">
            <div className="absolute inset-0 w-full h-full -z-0">
                <img
                    src={bg}
                    alt="Background"
                    className="w-full h-full object-fill pointer-events-none"
                />
            </div>
            {/* Optional overlay for better text readability */}
            {/* <div className="absolute inset-0 bg-black bg-opacity-30"></div> */}
            
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center  mb-12">
                    <h2 className="text-4xl font-bold text-black">{heading}</h2>
                    <p className="mt-4 text-lg text-black max-w-3xl mx-auto">
                        {subHeading}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 md:gap-x-12  gap-x-24">
                    {values.map((value, index) => (
                        <div key={index} className="flex mx-12 sm:mx-0 md:mx-5 mt-10 bg-[#3B3B3B] rounded-t-full flex-col items-center">
                            <div className="w-fit h-fit mt-10 rounded-full relative bottom-20 overflow-hidden">
                                <img src={`/api/image/download/${value.photo || "/placeholder.svg"}`} alt={value.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col justify-center items-center relative -mb-10 -top-16 px-7">
                                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                                <p
                                    className="text-white text-center text-md leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: value.description }}
                                ></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ValuesSection
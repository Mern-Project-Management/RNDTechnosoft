import React, { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

const DynamicMetaTags = () => {
    const [metaTitle, setMetaTitle] = useState("RND Technosoft - Home");
    const [metaDescription, setMetaDescription] = useState("Welcome to RND Technosoft, your trusted source for high-quality solutions.");
    const [metaKeywords, setMetaKeywords] = useState("RND Technosoft, home");
    const [ogImage, setOgImage] = useState("/path/to/default-image.jpg");
    const [googleSettings, setGoogleSettings] = useState({});
    const [favicon, setFavicon] = useState("");
    const location = useLocation();

    useEffect(() => {
        const fetchMetaData = async () => {
            try {
                let currentPath = location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
                console.log('Processed currentPath:', currentPath);

                // Fetch all data in parallel
                const [
                    Service_Category,
                    Package_Category,
                    Industrial_Category,
                    Portfolio_Category,
                    Static_Meta,
                    Google_Settings,
                    Favicon
                ] = await Promise.all([
                    axios.get(`/api/services/getall`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`/api/packages/getAll`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`/api/industries/getAll`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`/api/portfolio/getAll`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`/api/staticMeta/get-meta`, { withCredentials: true }).catch(() => ({ data: { data: [] } })),
                    axios.get(`/api/googlesettings/getGoogleSettings`, { withCredentials: true }).catch(() => ({ data: {} })),
                    axios.get(`/api/logo/getfavicon`, { withCredentials: true }).catch(() => ({ data: null }))
                ]);

                // Set Google settings & favicon globally for all pages
                setGoogleSettings(Google_Settings.data || {});
                if (Favicon.data) {
                    setFavicon(Favicon.data);
                }

                // Check service category data
                const serviceData = Service_Category.data.find(item => item.slug?.toLowerCase() === currentPath);
                if (serviceData) {
                    setMetaTitle(serviceData.metatitle || "Professional Services | RND Technosoft");
                    setMetaDescription(serviceData.metadescription || "Discover RND Technosoft's services solutions for your business.");
                    setMetaKeywords(serviceData.metakeywords || "services, RND Technosoft");
                    if (serviceData.photo && serviceData.photo.length > 0) {
                        setOgImage(`/uploads/${serviceData.photo}`);
                    }
                    return;
                }

                // Check package category data
                const packageData = Package_Category.data.find(item => item.slug?.toLowerCase() === currentPath);
                if (packageData) {
                    setMetaTitle(packageData.metatitle || "Professional Packages | RND Technosoft");
                    setMetaDescription(packageData.metadescription || "Discover RND Technosoft's packages solutions for your business.");
                    setMetaKeywords(packageData.metakeywords || "packages, RND Technosoft");
                    if (packageData.photo && packageData.photo.length > 0) {
                        setOgImage(`/uploads/${packageData.photo}`);
                    }
                    return;
                }

                // Check industrial category data
                const industrialData = Industrial_Category.data.find(item => item.slug?.toLowerCase() === currentPath);
                if (industrialData) {
                    setMetaTitle(industrialData.metatitle || "Professional Industries | RND Technosoft");
                    setMetaDescription(industrialData.metadescription || "Discover RND Technosoft's industries solutions for your business.");
                    setMetaKeywords(industrialData.metakeywords || "industries, RND Technosoft");
                    if (industrialData.photo && industrialData.photo.length > 0) {
                        setOgImage(`/uploads/${industrialData.photo}`);
                    }
                    return;
                }

                // Check portfolio data
                const portfolioData = Portfolio_Category.data.find(item => item.slug?.toLowerCase() === currentPath);
                if (portfolioData) {
                    setMetaTitle(portfolioData.metatitle || "Professional Portfolio | RND Technosoft");
                    setMetaDescription(portfolioData.metadescription || "Discover RND Technosoft's portfolio solutions for your business.");
                    setMetaKeywords(portfolioData.metakeywords || "portfolio, RND Technosoft");
                    if (portfolioData.photo && portfolioData.photo.length > 0) {
                        setOgImage(`/uploads/${portfolioData.photo}`);
                    }
                    return;
                }

                // Check subcategories and sub-subcategories
                const categories = [
                    { name: 'services', data: Service_Category.data },
                    { name: 'packages', data: Package_Category.data },
                    { name: 'industries', data: Industrial_Category.data },
                    { name: 'portfolios', data: Portfolio_Category.data }
                ];

                for (const category of categories) {
                    for (const item of category.data) {
                        if (Array.isArray(item.subCategories)) {
                            const matchedSubcategory = item.subCategories.find(sub => sub.slug?.toLowerCase() === currentPath);
                            if (matchedSubcategory) {
                                setMetaTitle(matchedSubcategory.metatitle || `Professional ${category.name} | RND Technosoft`);
                                setMetaDescription(matchedSubcategory.metadescription || `Discover RND Technosoft's ${category.name.toLowerCase()} solutions.`);
                                setMetaKeywords(matchedSubcategory.metakeywords || `${category.name.toLowerCase()}, RND Technosoft`);
                                if (matchedSubcategory.photo) {
                                    setOgImage(`/uploads/${matchedSubcategory.photo}`);
                                }
                                return;
                            }

                            for (const subcategory of item.subCategories) {
                                if (Array.isArray(subcategory.subSubCategory)) {
                                    const matchedSubSubcategory = subcategory.subSubCategory.find(subSub => subSub.slug?.toLowerCase() === currentPath);
                                    if (matchedSubSubcategory) {
                                        setMetaTitle(matchedSubSubcategory.metatitle || `Professional ${category.name} | RND Technosoft`);
                                        setMetaDescription(matchedSubSubcategory.metadescription || `Discover RND Technosoft's ${category.name.toLowerCase()} solutions.`);
                                        setMetaKeywords(matchedSubSubcategory.metakeywords || `${category.name.toLowerCase()}, RND Technosoft`);
                                        if (matchedSubSubcategory.photo) {
                                            setOgImage(`/uploads/${matchedSubSubcategory.photo}`);
                                        }
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }

                // Check static meta data
                const metaDataList = Static_Meta.data.data || [];
                let matchedMeta = metaDataList.find(
                    (meta) =>
                        meta.pageSlug &&
                        (meta.pageSlug.toLowerCase() === currentPath ||
                            meta.pageSlug.toLowerCase() === `/${currentPath}`)
                );

                if (currentPath === "" || currentPath === "/") {
                    matchedMeta = metaDataList.find(
                        (meta) => meta.pageSlug === "/" || meta.pageSlug === ""
                    );
                }

                if (matchedMeta) {
                    setMetaTitle(matchedMeta.metaTitle || "RND Technosoft - Home");
                    setMetaDescription(matchedMeta.metaDescription || "Welcome to RND Technosoft, your trusted source for high-quality solutions.");
                    setMetaKeywords(matchedMeta.metaKeyword || "RND Technosoft, home");
                    setOgImage(matchedMeta.metaImage || "/path/to/default-image.jpg");
                } else {
                    const staticPageMeta = metaDataList.find(
                        (meta) => meta.pageSlug && meta.pageSlug.toLowerCase() === "static-page"
                    );

                    if (staticPageMeta) {
                        setMetaTitle(staticPageMeta.metaTitle || "RND Technosoft - Home");
                        setMetaDescription(staticPageMeta.metaDescription || "Welcome to RND Technosoft, your trusted source for high-quality solutions.");
                        setMetaKeywords(staticPageMeta.metaKeyword || "RND Technosoft, home");
                    }
                }

            } catch (error) {
                console.error("Error fetching meta data:", error);
                setMetaTitle("RND Technosoft - Home");
                setMetaDescription("Welcome to RND Technosoft, your trusted source for high-quality solutions.");
                setMetaKeywords("RND Technosoft, home");
                setOgImage("/path/to/default-image.jpg");
            }
        };

        fetchMetaData();
    }, [location.pathname]);

    useEffect(() => {
        const createdTags = [];

        const updateMetaTag = (name, content, type = "name") => {
            let tag = document.querySelector(`meta[${type}="${name}"]`);
            if (!tag && content) {
                tag = document.createElement("meta");
                tag.setAttribute(type, name);
                document.head.appendChild(tag);
                createdTags.push(tag);
            }
            if (tag && content) {
                tag.setAttribute("content", content);
            }
        };

        // Update meta tags
        document.title = metaTitle;
        updateMetaTag("description", metaDescription);
        updateMetaTag("keywords", metaKeywords);
        updateMetaTag("og:title", metaTitle, "property");
        updateMetaTag("og:description", metaDescription, "property");
        updateMetaTag("og:type", "website", "property");
        updateMetaTag("og:url", window.location.href, "property");
        updateMetaTag("og:image", ogImage ? `${window.location.origin}${ogImage}` : "", "property");
        updateMetaTag("twitter:card", "summary_large_image");
        updateMetaTag("twitter:title", metaTitle);
        updateMetaTag("twitter:description", metaDescription);
        updateMetaTag("twitter:image", ogImage ? `${window.location.origin}${ogImage}` : "");

        // Update canonical link
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
            createdTags.push(canonicalLink);
        }
        canonicalLink.setAttribute('href', window.location.origin + location.pathname);

        // Handle Google settings scripts
     if (googleSettings) {
    if (
        googleSettings.headerscript &&
        typeof googleSettings.headerscript === "string" &&
        googleSettings.headerscript.trim().length > 0
    ) {
        const existingHeaderScript = document.querySelector('script[data-type="header"]');
        if (existingHeaderScript) {
            existingHeaderScript.remove();
        }
        const headerScript = document.createElement("script");
        headerScript.type = "text/javascript";
        headerScript.dataset.type = "header";
        headerScript.text = googleSettings.headerscript;
        document.head.appendChild(headerScript);
        createdTags.push(headerScript);
    }

    if (
        googleSettings.bodyscript &&
        typeof googleSettings.bodyscript === "string" &&
        googleSettings.bodyscript.trim().length > 0
    ) {
        const existingBodyScript = document.querySelector('script[data-type="body"]');
        if (existingBodyScript) {
            existingBodyScript.remove();
        }
        const bodyScript = document.createElement("script");
        bodyScript.type = "text/javascript";
        bodyScript.dataset.type = "body";
        bodyScript.text = googleSettings.bodyscript;
        document.body.appendChild(bodyScript);
        createdTags.push(bodyScript);
    }

    if (
        googleSettings.footerscript &&
        typeof googleSettings.footerscript === "string" &&
        googleSettings.footerscript.trim().length > 0
    ) {
        const existingFooterScript = document.querySelector('script[data-type="footer"]');
        if (existingFooterScript) {
            existingFooterScript.remove();
        }
        const footerScript = document.createElement("script");
        footerScript.type = "text/javascript";
        footerScript.dataset.type = "footer";
        footerScript.text = googleSettings.footerscript;
        document.body.appendChild(footerScript);
        createdTags.push(footerScript);
    }
}

        // Handle favicon
        if (favicon && favicon.photo) {
            let link = document.querySelector("link[rel='icon']");
            if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.head.appendChild(link);
            }
            link.href = `/api/logo/download/${favicon.photo}`;
            if (favicon.photo.endsWith('.svg')) {
                link.type = 'image/svg+xml';
            } else if (favicon.photo.endsWith('.png')) {
                link.type = 'image/png';
            }
        }

        // Cleanup on unmount
        return () => {
            createdTags.forEach((tag) => tag.remove());
        };
    }, [metaTitle, metaDescription, metaKeywords, ogImage, googleSettings, favicon, location.pathname]);

    return (
        <Helmet>
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />
            <meta property="og:image" content={ogImage ? `${window.location.origin}${ogImage}` : ""} />
            <link rel="canonical" href={window.location.origin + location.pathname} />
        </Helmet>
    );
};

export default DynamicMetaTags;
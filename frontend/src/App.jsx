import React, { lazy } from "react";
import { useEffect, useState, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import 'react-quill/dist/quill.snow.css'; // Or quill.bubble.css, depending on what you used

// backend 
const Sidebar = lazy(() => import('./adminComponent/Sidebar'));
const ServicesBack = lazy(() => import('./adminComponent/Pages/Services'));
const ServiceCategory = lazy(() => import('./adminComponent/Pages/Servicecategory'));
const CreateServiceCategory = lazy(() => import('./adminComponent/Pages/CreateServiceCategory'));
const EditServiceCategory = lazy(() => import('./adminComponent/Pages/EditServiceCategory'));
const PackageCategory = lazy(() => import('./adminComponent/Pages/PackageCategory'));
const CreatePackageCategory = lazy(() => import('./adminComponent/Pages/CreatePackageCategory'));
const EditPackageCategory = lazy(() => import('./adminComponent/Pages/EditPackageCategory'));
const IndustriesCategory = lazy(() => import('./adminComponent/Pages/IndustriesCategory'));
const CreateIndustriesCategory = lazy(() => import('./adminComponent/Pages/CreateIndustriesCategory'));
const EditIndustriesCategory = lazy(() => import('./adminComponent/Pages/EditIndustrieesCategory'));
const Industries = lazy(() => import('./adminComponent/Pages/Industries'));
const PortfolioCategory = lazy(() => import('./adminComponent/Pages/PortfolioCategory'));
const CreatePortfolioCategory = lazy(() => import('./adminComponent/Pages/CreatePortfolioCategory'));
const EditPortfolioCategory = lazy(() => import('./adminComponent/Pages/EditPortfolioCategory'));
const Portfolio = lazy(() => import('./adminComponent/Pages/Portfolio'));
const CreatePortfolio = lazy(() => import('./adminComponent/Pages/CreatePortfolio'));
const EditPortfolio = lazy(() => import('./adminComponent/Pages/EditPortfolio'));

const News = lazy(() => import('./adminComponent/Pages/News'));
const CreateNews = lazy(() => import('./adminComponent/Pages/CreateNews'));
const EditNews = lazy(() => import('./adminComponent/Pages/EditNews'));
const NewsCategory = lazy(() => import('./adminComponent/Pages/NewsCategory'));
const CreateNewsCategory = lazy(() => import('./adminComponent/Pages/CreateNewsCategory'));
const EditNewsCategory = lazy(() => import('./adminComponent/Pages/EditNewsCategory'));
const Testimonials = lazy(() => import('./adminComponent/Pages/Testimonials'));
const CreateTestimonials = lazy(() => import('./adminComponent/Pages/CreateTestimonials'));
const CreateTestimonialsSub = lazy(() => import('./adminComponent/Pages/CreateTestimonialSub'));
const CreateTestimonialsSubSub = lazy(() => import('./adminComponent/Pages/CreateTestimonialSubSub'));
const EditTestimonials = lazy(() => import('./adminComponent/Pages/EditTestimonials'));
const FAQ = lazy(() => import('./adminComponent/Pages/FAQ'));
const CreateFAQ = lazy(() => import('./adminComponent/Pages/CreateFAQ'));
const EditFAQ = lazy(() => import('./adminComponent/Pages/EditFAQ'));
const OurStaff = lazy(() => import('./adminComponent/Pages/Staff'));
const CreateStaff = lazy(() => import('./adminComponent/Pages/CreateStaff'));
const EditStaff = lazy(() => import('./adminComponent/Pages/EditStaff'));
const Banner = lazy(() => import('./adminComponent/Pages/Banner'));
const CreateBanner = lazy(() => import('./adminComponent/Pages/CreateBanner'));
const EditBanner = lazy(() => import('./adminComponent/Pages/EditBanner'));
const ProductCategory = lazy(() => import('./adminComponent/Pages/ProductCategory'));
const CreateProductCategory = lazy(() => import('./adminComponent/Pages/CreateCategory'));
const EditCategory = lazy(() => import('./adminComponent/Pages/EditCategory'));
const PageContent = lazy(() => import('./adminComponent/Pages/PageContent'));
const CreatePageContent = lazy(() => import('./adminComponent/Pages/CreatePageContent'));
const Product = lazy(() => import('./adminComponent/Pages/Product'));
const CreateProduct = lazy(() => import('./adminComponent/Pages/CreateProduct'));
const EditProduct = lazy(() => import('./adminComponent/Pages/EditProduct'));



const Dashboard = lazy(() => import('./adminComponent/Pages/Dashboard'));

import Signup from "./adminComponent/Adminsignup"
import Login from "./adminComponent/Adminlogin";
import VerifyOTP from "./adminComponent/VerifyOTP";
import ResetPassword from "./adminComponent/ResetPassword";
import EditPageContent from './adminComponent/Pages/EditPageContent';
import ForgetPassword from './adminComponent/ForgotPassword';
import DatabaseManagement from './adminComponent/Pages/DatabaseManagement';
import ManagePassword from "./adminComponent/Pages/ManagePassword";
const Logo = lazy(() => import('./adminComponent/Pages/Logo'));
const CreateAboutUsPoints = lazy(() => import('./adminComponent/Pages/CreateAboutuspoints'));
const EditAboutUsPoints = lazy(() => import('./adminComponent/Pages/EditAboutuspoints'));
const Achievements = lazy(() => import('./adminComponent/Pages/Achievements'));
const CreateAchievements = lazy(() => import('./adminComponent/Pages/CreateAchievements'));
const EditAchievement = lazy(() => import('./adminComponent/Pages/EditAchievements'));
const Counter = lazy(() => import('./adminComponent/Pages/Counter'));
const EditCounter = lazy(() => import('./adminComponent/Pages/EditCounter'));
const CreateCounter = lazy(() => import('./adminComponent/Pages/CreateCounter'));
const Inquiry = lazy(() => import('./adminComponent/Pages/Inquiry'));
const Corevalue = lazy(() => import('./adminComponent/Pages/Corevalue'));
const CreateCorevalue = lazy(() => import('./adminComponent/Pages/CreateCorevalue'));
const EditCorevalue = lazy(() => import('./adminComponent/Pages/EditCorevalue'));
const Aboutcompany = lazy(() => import('./adminComponent/Pages/Aboutcompany'));
const Careeroption = lazy(() => import('./adminComponent/Pages/Careeroptions'));
const CreateCareeroption = lazy(() => import('./adminComponent/Pages/CreateCareeroption'));
const EditCareeroption = lazy(() => import('./adminComponent/Pages/EditCareeroption'));
const Careerinquiry = lazy(() => import('./adminComponent/Pages/Careerinquiry'));
const Footer = lazy(() => import('./adminComponent/Pages/Footer'));
const Header = lazy(() => import('./adminComponent/Pages/Header'));
const WhatsappSettings = lazy(() => import('./adminComponent/Pages/WhatsappSettings'));
const GoogleSettings = lazy(() => import('./adminComponent/Pages/GoogleSettings'));
const Menulisting = lazy(() => import('./adminComponent/Pages/Menulisting'));
const CreateMenulisting = lazy(() => import('./adminComponent/Pages/CreateMenulisting'));
const EditMenulisting = lazy(() => import('./adminComponent/Pages/EditMenulisting'));
const Sitemap = lazy(() => import('./adminComponent/Pages/Sitemap'));
const CreateSitemap = lazy(() => import('./adminComponent/Pages/CreateSitemap'));
const EditSitemap = lazy(() => import('./adminComponent/Pages/EditSitemap'));
const Metadetails = lazy(() => import('./adminComponent/Pages/Metadetails'));
const EditMetadetails = lazy(() => import('./adminComponent/Pages/EditMetadetails'));
const ManageProfile = lazy(() => import('./adminComponent/Pages/ManageProfile'));
const MissionAndVision = lazy(() => import('./adminComponent/Pages/MissionAndVision'));
const Benefits = lazy(() => import('./adminComponent/Pages/Benefits'));
const CreateBenefits = lazy(() => import('./adminComponent/Pages/CreateBenefits'));
const EditBenefits = lazy(() => import('./adminComponent/Pages/EditBenefits'));
const ManageColor = lazy(() => import('./adminComponent/Pages/ManageColor'));
const CreateServiceDetails = lazy(() => import('./adminComponent/Pages/CreateServiceDetails'));
const EditServiceDetails = lazy(() => import('./adminComponent/Pages/EditServicePage'));
const CreateServiceImage = lazy(() => import('./adminComponent/Pages/CreateServiceImage'));
const EditServiceImages = lazy(() => import('./adminComponent/Pages/EditServiceImages'));
import Cookies from "js-cookie";
const Homepage = lazy(() => import('./pages/Homepage'));
const MainPage = lazy(() => import('./pages/Mainpage'));
const Templates = lazy(() => import('./pages/Templates'));
const AllReviews = lazy(() => import('./components/WhatWeDo/AllReviews'));
const HomeHerosection = lazy(() => import('./adminComponent/Pages/HomeHerosection'));
import DynamicPage from "./pages/DynamicPages";
import HexGridDemo from "./components/hexagon/Grid";
import TechnologyPage from "./components/technology/Page";
import AddTechCategoryForm from "./adminComponent/Pages/TechCategory/AddTechCategory";
import TechCategoryTable from "./adminComponent/Pages/TechCategory/TachCategoryTable";
import EditTechCategoryForm from "./adminComponent/Pages/TechCategory/EditTechCategory";
import TechnologyManager from "./adminComponent/Pages/TechCategory/Technology";
import TechnologySecDataForm from "./adminComponent/Pages/TechCategory/TechnologySecForm";
import TechnologyDataTable from "./adminComponent/Pages/TechCategory/TechnologySecData";
import MainIndustry from "./components/Industry/MainIndustry";
import MainHireTelent from "./components/HireTelent/MainHireTelent";
import CreateCaseStudy from "./adminComponent/caseStudy/CaseStudyForm";
import IndustrySecDataTable from "./adminComponent/caseStudy/CaseStudyList";
import CreateHireTelent from "./adminComponent/Hire_Talent/AddHireTalent";
import HireTalentTable from "./adminComponent/Hire_Talent/HireTalentTable";
const CreatePackage = lazy(() => import('./adminComponent/Pages/CreatePackage'));
const EditPackageForm = lazy(() => import('./adminComponent/Pages/EditPackage'));

const CreatePackageDescription = lazy(() => import('./adminComponent/Pages/CreatePackageDescription'));
const EditPackageDescription = lazy(() => import('./adminComponent/Pages/EditPackageDescription'));
const DesignProcessForm = lazy(() => import('./adminComponent/Pages/CreateDesignProcess'));
const EditDesignProcess = lazy(() => import('./adminComponent/Pages/EditDesignProcess'));
const EditWebSolutionDetails = lazy(() => import('./adminComponent/Pages/WebSolution'));
const EditServicePage = lazy(() => import('./adminComponent/Pages/EditEachCategory'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Collabration = lazy(() => import('./pages/Collabration'));
const GetInTouch = lazy(() => import('./pages/Contact'));
const Faq = lazy(() => import('./pages/Faq'));
const NewSubmenuListingForm = lazy(() => import('./adminComponent/Pages/CreateSubMenu'));
const EditSubmenuForm = lazy(() => import('./adminComponent/Pages/EditSubMenu'));
const PrivacyPolicy = lazy(() => import('./components/CookiePolice'));
const PrivacyPolicysss = lazy(() => import('./components/PravicyPolice'));
const TermsCondition = lazy(() => import('./components/TermsCondition'));
const DynamicMetaTags = lazy(() => import('./components/DynamicMetaTag'));
const BlogSubSub = lazy(() => import('./pages/Blogs/SubSubBlog'));
const EditSubServicePage = lazy(() => import('./adminComponent/Pages/EditEachSubcategory'));
const EditSubSubServicePage = lazy(() => import('./adminComponent/Pages/EditEachsubsubcategory'));
const NewSubServiceForm = lazy(() => import('./adminComponent/Pages/CreateSubServiceDetail'));
const EditSubServiceDetails = lazy(() => import('./adminComponent/Pages/EditSubServicePage'));
const NewSubSubServiceForm = lazy(() => import('./adminComponent/Pages/CreateSubSubServiceDetails'));
const EditSubSubServiceDetails = lazy(() => import('./adminComponent/Pages/EditSubSubServicePage'));
const NewSubGalleryForm = lazy(() => import('./adminComponent/Pages/CreateSubServiveImage'));
const NewSubSubGalleryForm = lazy(() => import('./adminComponent/Pages/CreateSubSubServiceImage'));
const DesignSubProcessForm = lazy(() => import('./adminComponent/Pages/CreateSubDesignProcess'));
const DesignSubSubProcessForm = lazy(() => import('./adminComponent/Pages/CreateSubSubDesignProcess'));
const EditIndustiresPage = lazy(() => import('./adminComponent/Pages/EditEachIndustriesCategory'));
const EditIndustiresSubPage = lazy(() => import('./adminComponent/Pages/EditEachIndustriesSubCategory'));
const EditIndustiresSubsubPage = lazy(() => import('./adminComponent/Pages/EditEachIndustriesSubsubcategory'));
const NewIndustriesForm = lazy(() => import('./adminComponent/Pages/industriescomponent/main/CreateDetails'));
const EditIndustriesForm = lazy(() => import('./adminComponent/Pages/industriescomponent/main/EditDetails'));
const NewIndustriesSubForm = lazy(() => import('./adminComponent/Pages/industriescomponent/sub/CreateDetails'));
const EditIndustriesSubForm = lazy(() => import('./adminComponent/Pages/industriescomponent/sub/EditDetails'));
const Homeanimation = lazy(() => import('./adminComponent/Pages/Homeanimation/Homeanimation'));
const EditHomeanimation = lazy(() => import('./adminComponent/Pages/Homeanimation/EditHomeanimation'));
const CreateHomeanimation = lazy(() => import('./adminComponent/Pages/Homeanimation/CreateHomeanimation'));
const NewIndustriesSubSubForm = lazy(() => import('./adminComponent/Pages/industriescomponent/subsub/CreateDetails'));
const EditIndustriesSubSubForm = lazy(() => import('./adminComponent/Pages/industriescomponent/subsub/EditDetails'));
const ContactUs = lazy(() => import('./Pages/ContactUs'));
const ContactInfoData = lazy(() => import('./adminComponent/Pages/contactInfo/ContactInfo'));
const CreateContactInfo = lazy(() => import('./adminComponent/Pages/contactInfo/AddContactInfo'));
const EditContactInfo = lazy(() => import('./adminComponent/Pages/contactInfo/EditContactinfo'));
const ContactInquiry = lazy(() => import('./adminComponent/Pages/contactInfo/Contactinquiries'));
const ManageSectionVisibility = lazy(() => import('./adminComponent/Pages/ManageSectionVisibility'));
const Newsletter = lazy(() => import('./adminComponent/Pages/Newsletter'));
const AddCard = lazy(() => import('./adminComponent/Pages/Cards/AddCards'));
const ShowCard = lazy(() => import('./adminComponent/Pages/Cards/showCards'));
const UpdateCard = lazy(() => import('./adminComponent/Pages/Cards/UpdateCards'));
const PopupInquiry = lazy(() => import('./adminComponent/Pages/PopupInquiry'));
const HerosectionInquiry = lazy(() => import('./adminComponent/Pages/HerosectionInquiry'));
const Thankyou = lazy(() => import('./components/Thankyou'));
const Career = lazy(() => import('./pages/Career'));
const Popup = lazy(() => import('./components/Popup'));
const Portfolios = lazy(() => import('./pages/Portfolios'));
const Logotype = lazy(() => import('./adminComponent/Pages/Logotype'));
const CreateLogoType = lazy(() => import('./adminComponent/Pages/CreateLogotype'));
const EditLogotype = lazy(() => import('./adminComponent/Pages/EditLogotype'));
const CreateIndustryImage = lazy(() => import('./adminComponent/Pages/CreateIndustryImage'));
const CreateSubIndustryImage = lazy(() => import('./adminComponent/Pages/CreateSubIndustryImage'));
const CreateSubSubIndustryImage = lazy(() => import('./adminComponent/Pages/CreateSubSubIndustryImage'));
const EditIndustryImage = lazy(() => import('./adminComponent/Pages/EditIndustryImage'));
const MainPackageComponent = lazy(() => import('./adminComponent/Pages/package/NewsTable'));
const MainFaqSection = lazy(() => import('./adminComponent/Pages/faq/MainFaqSection'));
const JobApplicationForm = lazy(() => import('./components/jobApplication/JobApplicationForm'));
const JobApplicationsPage = lazy(() => import('./components/jobApplication/JobApplicationPage'));
const JobApplicationsTable = lazy(() => import('./components/jobApplication/JobApplicationTable'));
const CompanyCategories = lazy(() => import('./adminComponent/Pages/CompanyCategories'));
const EditCompanyInfo = lazy(() => import('./adminComponent/Pages/EditCompanyInfo'));
const CompanyGalleryForm = lazy(() => import('./adminComponent/Pages/package/CompanyGalleryForm'));
const PremiumTemplate = lazy(() => import('./adminComponent/Pages/package/PremiumTemplate'));
const GetInTouchCard = lazy(() => import('./adminComponent/Pages/package/GetInTouch'));
const WeAreExpert = lazy(() => import('./adminComponent/Pages/serviceComp/WeAreExpert'));
const WhyPartnerUs = lazy(() => import('./adminComponent/Pages/serviceComp/WhyPartnerUs'));
const StaticMetaForm = lazy(() => import('./components/MetaInfo/MetaInfoForm'));
const MetaList = lazy(() => import('./components/MetaInfo/MetaList'));
const MenuListingTable = lazy(() => import('./adminComponent/Pages/Menulisting'));
const NavbarDataTable = lazy(() => import('./components/MetaInfo/NavBarData'));
const AddNavbarData = lazy(() => import('./components/MetaInfo/AddNavbar'));
const EditNavbar = lazy(() => import('./components/MetaInfo/EditNavbarData'));


const ScrollToTop = () => {
  const { pathname } = useLocation();
  console.log("Current pathname:", pathname);
  useEffect(() => {
    console.log("Scrolling to top");
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Adjust the time as needed

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []);

  useEffect(() => {
    const token = Cookies.get('jwt');
    console.log(token)
    if (token) {
      setIsLoggedIn(true);
    } else {
      console.log("User is not logged in");
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const token = Cookies.get("jwt");

    if (!token) {
      return <Navigate to="/login" state={{ from: location }} />;
    }

    return children;
  };
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen w-full bg-white">
          <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
        </div>
      }>
        <ScrollToTop />
        <DynamicMetaTags />
        {isLoading ? (
          // Show loading video while loading
          <>
            <div className="flex justify-center items-center h-screen w-full bg-white">
              {/* <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div> */}
            </div>
          </>
        ) : (
          <>
            {/* {!isLoggedIn && <Popup />} */}
            <Routes>
              <Route path="/hex" element={<HexGridDemo />} />
              <Route path="/" element={<MainPage />}>
                <Route path="/" index element={
                  <>
                    <Popup />
                    <Homepage />
                  </>
                }
                />
                <Route path="/:slug" element={<DynamicPage />} />
                <Route path="/blog/:slug" element={<BlogSubSub />} />
                <Route path="/all-reviews" element={<AllReviews />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/collabration" element={<Collabration />} />
                <Route path="/contact" element={<GetInTouch />} />
                <Route path="/technology/:slug" element={<TechnologyPage />} />
                <Route path="/popup" element={<Popup />} />
                <Route path="/technologies" element={<TechnologyPage />} />
                <Route path="/industry" element={<MainIndustry />} />
                <Route path="/industries/:slug" element={<MainIndustry />} />
                <Route path="/helpCenter" element={<Faq />} />
                <Route path="/cookies-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsCondition />} />
                <Route path="/privacy-policy" element={<PrivacyPolicysss />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/career" element={<Career />} />
                <Route path="/job-application-form" element={<JobApplicationForm />} />
                <Route path="/thankyou" element={<Thankyou />} />
                <Route path="/portfolios" element={<Portfolios />} />
                <Route path="/hire-talent" element={<MainHireTelent />} />
              </Route>
              {!isLoggedIn ? (
                <>
                  <Route path="/login" element={<Login />} />
                  <Route path="/resetpassword" element={<ResetPassword />} />
                  <Route path="/verifyOTP" element={<VerifyOTP />} />
                  <Route path="/forgetpassword" element={<ForgetPassword />} />
                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                </>
              ) : (
                <><Route path="/login" element={<Navigate to="/dashboard" />} /><Route path="/" element={<Sidebar />}>
                  <Route index element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  <Route path="/application-req" element={<JobApplicationsTable />} />
                  <Route path="/services" element={<ServicesBack />} />
                  <Route path="/company-category" element={<CompanyCategories />} />
                  <Route path="/edit-category-company/:categoryId" element={<EditCompanyInfo />} />
                  <Route path="/company-gallery-form/:categoryId" element={<CompanyGalleryForm />} />
                  <Route path="/edit-template-card" element={<PremiumTemplate />} />
                  <Route path="/edit-card" element={<GetInTouchCard />} />
                  <Route path="/why-partner-us" element={<WhyPartnerUs />} />
                  <Route path="/ServiceCategory" element={<ServiceCategory />} />
                  <Route path="/we-are-expert" element={<WeAreExpert />} />
                  <Route path="/meta-form" element={<StaticMetaForm />} />
                  <Route path="/meta/edit-meta-form/:id" element={<StaticMetaForm />} />
                  <Route path="/meta-table" element={<MetaList />} />
                  <Route path="/navbar-data" element={<NavbarDataTable />} />
                  <Route path="/add-navbar-data" element={<AddNavbarData />} />
                  <Route path="/edit-navbar-data/:id" element={<EditNavbar />} />

                  {/* Case Study  */}
                  <Route path="/industry-data/add-case-study" element={<CreateCaseStudy />} />
                  <Route path="/industry-data" element={<IndustrySecDataTable />} />
                  <Route path="/industry-data/edit-industry-data/:id" element={<CreateCaseStudy />} />
                    {/* Hire talent */}
                  <Route path="/hire-talent-table/add-hire-talent" element={<CreateHireTelent />} />
                  <Route path="/hire-talent-table" element={<HireTalentTable />} />
                  <Route path="/hire-talent-table/edit-hire-table/:id" element={<CreateHireTelent />} />

                 
                  <Route path="/ServiceCategory/CreateServiceCategory" element={<CreateServiceCategory />} />
                  <Route path="/ServiceCategory/editServiceCategory/:categoryId/:subCategoryId?/:subSubCategoryId?" element={<EditServiceCategory />} />
                  <Route path="/PackageCategory" element={<PackageCategory />} />
                  <Route path="/PackageCategory/CreatePackageCategory" element={<CreatePackageCategory />} />
                  <Route path="/PackageCategory/editPackageCategory/:categoryId/:subCategoryId?/:subSubCategoryId?" element={<EditPackageCategory />} />
                  <Route path="/package" element={<MainPackageComponent />} />
                  <Route path="/package/createPackage" element={<CreatePackage />} />
                  <Route path="/package/editPackage/:packageId" element={<EditPackageForm />} />
                  <Route path="/package/createPackageDescription" element={<CreatePackageDescription />} />
                  <Route path="/package/editPackageDescription/:packageId" element={<EditPackageDescription />} />
                  <Route path="/IndustriesCategory" element={<IndustriesCategory />} />
                  <Route path="/IndustriesCategory/CreateIndustriesCategory" element={<CreateIndustriesCategory />} />
                  <Route path="/IndustriesCategory/editIndustriesCategory/:categoryId/:subCategoryId?/:subSubCategoryId?" element={<EditIndustriesCategory />} />
                  <Route path="/industries" element={<Industries />} />
                  <Route path="/PortfolioCategory" element={<PortfolioCategory />} />
                  <Route path="/PortfolioCategory/CreatePortfolioCategory" element={<CreatePortfolioCategory />} />
                  <Route path="/PortfolioCategory/:categoryId/:subCategoryId?/:subSubCategoryId?" element={<EditPortfolioCategory />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/createNews" element={<CreateNews />} />
                  <Route path="/news/editNews/:slugs" element={<EditNews />} />
                  <Route path="/homeanimation" element={<Homeanimation />} />
                  <Route path="/homeanimation/createHomeanimation" element={<CreateHomeanimation />} />
                  <Route path="/homeanimation/editHomeanimation/:id" element={<EditHomeanimation />} />
                  <Route path="/portfolio" element={<Portfolio />} /> 
                  <Route path="/portfolio/createPortfolio" element={<CreatePortfolio />} />
                  <Route path="/portfolio/:slugs" element={<EditPortfolio />} />
                  <Route path="/NewsCategory" element={<NewsCategory />} />
                  <Route path="/NewsCategory/CreateNewsCategory" element={<CreateNewsCategory />} />
                  <Route path="/NewsCategory/editNewsCategory/:categoryId/:subCategoryId?/:subSubCategoryId?" element={<EditNewsCategory />} />
                  <Route path="/testimonials" element={<Testimonials />} />
                  <Route path="/testimonials/createTestimonials" element={<CreateTestimonials />} />
                  <Route path="/testimonials/createTestimonials/:categoryId" element={<CreateTestimonials />} />
                  <Route path="/testimonials/createTestimonials/:categoryId/:subcategoryId" element={<CreateTestimonialsSub />} />
                  <Route path="/testimonials/createTestimonials/:categoryId/:subcategoryId/:subsubcategoryId" element={<CreateTestimonialsSubSub />} />
                  <Route path="/popup-inquiry" element={<PopupInquiry />} />
                  <Route path="/all-inquiries" element={<PopupInquiry />} />
                  <Route path="/hero-inquiry" element={<HerosectionInquiry />} />
                  <Route path="/testimonials/editTestimonials/:id" element={<EditTestimonials />} />
                  <Route path="/faq" element={<MainFaqSection />} />
                  <Route path="/faq/createFAQ" element={<CreateFAQ />} />
                  <Route path="/faq/editFAQ/:id" element={<EditFAQ />} />
                  <Route path="/ourTeam" element={<OurStaff />} />
                  <Route path="/ourTeam/createTeam" element={<CreateStaff />} />
                  <Route path="/ourTeam/editTeam/:id" element={<EditStaff />} />
                  <Route path="/banner" element={<Banner />} />
                  <Route path="/banner/createBanner" element={<CreateBanner />} />
                  <Route path="/banner/editBanner/:id" element={<EditBanner />} />
                  <Route path="/ProductCategory" element={<ProductCategory />} />
                  <Route path="/ProductCategory/CreateProductCategory" element={<CreateProductCategory />} />
                  <Route path="/ProductCategory/editProductCategory/:categoryId/:subCategoryId?/:subSubCategoryId?" element={<EditCategory />} />
                  <Route path="/extrapages" element={<PageContent />} />
                  <Route path="/extrapages/createextrapages" element={<CreatePageContent />} />
                  <Route path="/extrapages/editextrapages/:id" element={<EditPageContent />} />
                  <Route path="/pageContent/createPoints" element={<CreateAboutUsPoints />} />
                  <Route path="/pageContent/editPoints/:id" element={<EditAboutUsPoints />} />
                  <Route path="/product" element={<Product />} />
                  <Route path="/product/createProduct" element={<CreateProduct />} />
                  <Route path="/product/editProduct/:slugs" element={<EditProduct />} />
                  <Route path="/manageLogo" element={<Logo />} />
                  <Route path="/DatabaseManagement" element={<DatabaseManagement />} />
                  <Route path="/managePassword" element={<ManagePassword />} />
                  <Route path="/manageProfile" element={<ManageProfile />} />
                  <Route path="/certificates" element={<Achievements />} />
                  <Route path="/certificates/createcertificates" element={<CreateAchievements />} />
                  <Route path="/certificates/editcertificates/:id" element={<EditAchievement />} />
                  <Route path="/counter" element={<Counter />} />
                  <Route path="/counter/editCounter/:id" element={<EditCounter />} />
                  <Route path="/counter/createCounter" element={<CreateCounter />} />
                  <Route path="/Inquiry" element={<Inquiry />} />
                  <Route path="/missionandvision" element={<MissionAndVision />} />
                  <Route path="/corevalue" element={<Corevalue />} />
                  <Route path="/corevalue/createCorevalue" element={<CreateCorevalue />} />
                  <Route path="/corevalue/editCorevalue/:id" element={<EditCorevalue />} />
                  <Route path="/Card" element={<ShowCard />} />
                  <Route path="/Card/createCard" element={<AddCard />} />
                  <Route path="/Card/editCard/:id" element={<UpdateCard />} />
                  <Route path="/aboutcompany" element={<Aboutcompany />} />
                  <Route path="/careeroption" element={<Careeroption />} />
                  <Route path="/careeroption/createCareerOption" element={<CreateCareeroption />} />
                  <Route path="/careeroption/editCareerOption/:id" element={<EditCareeroption />} />
                  <Route path="/careerinquiry" element={<Careerinquiry />} />
                  <Route path="/footer" element={<Footer />} />
                  <Route path="/header" element={<Header />} />

                  {/* Technology section */}
                  <Route path="/add-technology" element={<AddTechCategoryForm />} />
                  <Route path="/tech-category" element={<TechCategoryTable />} />
                  <Route path="/edit-tech-category/:id" element={<EditTechCategoryForm />} />
                  <Route path="/technology" element={<TechnologyManager />} />

                  <Route path="/manage-tech-sec" element={<TechnologySecDataForm />} />
                  <Route path="/tech-sec-data" element={<TechnologyDataTable />} />
                  <Route path="/technology-form/:id" element={<TechnologySecDataForm />} />

                  {/* <Route path="/globalpresence" element={<Globalpresence />} /> */}
                  <Route path="/whatsappSettings" element={<WhatsappSettings />} />
                  <Route path="/googleSettings" element={<GoogleSettings />} />
                  <Route path="/menulisting" element={<Menulisting />} />
                  <Route path="/menulisting/createMenulisting" element={<CreateMenulisting />} />
                  <Route path="/menulisting/editMenulisting/:id" element={<EditMenulisting />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/sitemap/createSitemap" element={<CreateSitemap />} />
                  <Route path="/sitemap/editSitemap/:id/:type" element={<EditSitemap />} />
                  <Route path="/metadetails" element={<Metadetails />} />
                  <Route path="/metadetails/editmetaDetails/:id/:type" element={<EditMetadetails />} />
                  <Route path="/benefits" element={<Benefits />} />
                  <Route path="/benefits/createBenefits" element={<CreateBenefits />} />
                  <Route path="/benefits/editBenefits/:id" element={<EditBenefits />} />
                  <Route path="/manageTheme" element={<ManageColor />} />
                  <Route path="/contactinfo" element={<ContactInfoData />} />
                  <Route path="/contactinfo/createContactinfo" element={<CreateContactInfo />} />
                  <Route path="/contactinfo/editContactinfo/:id" element={<EditContactInfo />} />
                  <Route path="/conatctinquiries" element={<ContactInquiry />} />
                  <Route path="/inquiries" element={<Navigate to="/popup-inquiry" replace />} />
                  <Route path="/managesectionvisibility" element={<ManageSectionVisibility />} />
                  {/* made for me  */}
                  <Route path="/homehero" element={<HomeHerosection />} />
                  <Route path="/services/createService/:categoryId" element={<CreateServiceDetails />} />
                  <Route path="/services/createService/:categoryId/:subcategoryId" element={<NewSubServiceForm />} />
                  <Route path="/services/createService/:categoryId/:subcategoryId/:subsubcategoryId" element={<NewSubSubServiceForm />} />
                  <Route path="/services/edit-service/:categoryId" element={<EditServicePage />} />
                  <Route path="/services/edit-subcategory/:categoryId/:subcategoryId" element={<EditSubServicePage />} />
                  <Route path="/services/edit-subsubcategory/:categoryId/:subcategoryId/:subsubcategoryId" element={<EditSubSubServicePage />} />
                  <Route path="/services/editService/:categoryId" element={<EditServiceDetails />} />
                  <Route path="/services/editSubService/:categoryId" element={<EditSubServiceDetails />} />
                  <Route path="/services/editSubSubService/:categoryId" element={<EditSubSubServiceDetails />} />
                  <Route path="/services/createImage/:categoryId" element={<CreateServiceImage />} />
                  <Route path="/services/createImage/:categoryId/:subcategoryId" element={<NewSubGalleryForm />} />
                  <Route path="/services/createImage/:categoryId/:subcategoryId/:subsubcategoryId" element={<NewSubSubGalleryForm />} />
                  <Route path="/industries/createImage/:categoryId" element={<CreateIndustryImage />} />
                  <Route path="/industries/createImage/:categoryId/:subcategoryId" element={<CreateSubIndustryImage />} />
                  <Route path="/industries/createImage/:categoryId/:subcategoryId/:subsubcategoryId" element={<CreateSubSubIndustryImage />} />
                  <Route path="/services/editImages/:categoryId" element={<EditServiceImages />} />
                  <Route path="/industries/editImages/:categoryId" element={<EditIndustryImage />} />
                  <Route path="/services/designProcess/:categoryId" element={<DesignProcessForm />} />
                  <Route path="/services/designProcess/:categoryId/:subcategoryId" element={<DesignSubProcessForm />} />
                  <Route path="/services/designProcess/:categoryId/:subcategoryId/:subsubcategoryId" element={<DesignSubSubProcessForm />} />
                  <Route path="/services/editDesignProcess/:processId" element={<EditDesignProcess />} />
                  <Route path="/extrapages/:contentType" element={<EditWebSolutionDetails />} />
                  <Route path="/menulisting/createSubmenu" element={<NewSubmenuListingForm />} />
                  <Route path="/menulisting/editSubmenu/:id" element={<EditSubmenuForm />} />
                  <Route path="/industries/edit-industries/:categoryId" element={<EditIndustiresPage />} />
                  <Route path="/industries/edit-subcategory/:categoryId/:subcategoryId" element={<EditIndustiresSubPage />} />
                  <Route path="/industries/edit-subsubcategory/:categoryId/:subcategoryId/:subsubcategoryId" element={<EditIndustiresSubsubPage />} />
                  <Route path="/industries/createIndustries/:categoryId" element={<NewIndustriesForm />} />
                  <Route path="/industries/editIndustries/:categoryId" element={<EditIndustriesForm />} />
                  <Route path="/industries/createIndustries/:categoryId/:subcategoryId" element={<NewIndustriesSubForm />} />
                  <Route path="/industries/editSubIndustries/:categoryId" element={<EditIndustriesSubForm />} />
                  <Route path="/industries/createIndustries/:categoryId/:subcategoryId/:subsubcategoryId" element={<NewIndustriesSubSubForm />} />
                  <Route path="/industries/editSubsubIndustries/:categoryId" element={<EditIndustriesSubSubForm />} />
                  <Route path="/newsletter" element={<Newsletter />} />
                  <Route path="/logotype" element={<Logotype />} />
                  <Route path="/logotype/createLogotype" element={<CreateLogoType />} />
                  <Route path="/logotype/editLogotype/:id" element={<EditLogotype />} />
                </Route></>
              )}
            </Routes>
          </>
        )}
      </Suspense>
    </BrowserRouter>
  );
}
export default App;
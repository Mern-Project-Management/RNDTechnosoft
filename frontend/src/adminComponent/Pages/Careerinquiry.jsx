import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { Trash2, Download, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";
import Modal from 'react-modal';
import { debounce } from 'lodash';
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import InquiryTabs from "../InquiryTabs";

Modal.setAppElement('#root');

const CareerInquiryTable = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [totalCount, setTotalCount] = useState(0);
  const [countWithFields, setCountWithFields] = useState(0);
  const [countWithoutFields, setCountWithoutFields] = useState(0);
  const [dataWithFields, setDataWithFields] = useState([]);
  const [dataWithoutFields, setDataWithoutFields] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);

  // Debounced fetch data function
  const debouncedFetchInquiryData = useMemo(
    () => debounce(async (term) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/careerInquiries/getcareerInquiries?search=${encodeURIComponent(term)}`,
          { withCredentials: true, timeout: 10000 }
        );
        const { totalCount, countWithFields, countWithoutFields, dataWithFields, dataWithoutFields, inquiries } = response.data;

        setTotalCount(totalCount);
        setCountWithFields(countWithFields);
        setCountWithoutFields(countWithoutFields);
        setDataWithFields(dataWithFields.map((item, index) => ({
          ...item,
          id: index + 1,
          name: item.name || 'N/A',
          mobileNo: item.mobileNo || 'N/A',
          email: item.email || 'N/A',
          message: item.message || 'N/A',
        })));
        setDataWithoutFields(dataWithoutFields.map((item, index) => ({
          ...item,
          id: index + 1,
          name: item.name || 'N/A',
          mobileNo: item.mobileNo || 'N/A',
          email: item.email || 'N/A',
          message: item.message || 'N/A',
        })));
        setInquiries(inquiries.map((item, index) => ({
          ...item,
          id: index + 1,
          name: item.name || 'N/A',
          mobileNo: item.mobileNo || 'N/A',
          email: item.email || 'N/A',
          message: item.message || 'N/A',
        })));
      } catch (error) {
        console.error("Error fetching inquiries:", error);
        const statusCode = error.response?.status ? `(${error.response.status})` : '';
        toast.error(error.code === 'ERR_CANCELED' ? 'Request timed out' : `Failed to fetch inquiries ${statusCode}.`);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value; // Allow spaces
    setSearchTerm(newSearchTerm);
    debouncedFetchInquiryData(newSearchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    debouncedFetchInquiryData("");
  };

  const filteredData = useMemo(() => {
    switch (selectedCategory) {
      case "GPM":
        return dataWithFields || [];
      case "SEO":
        return dataWithoutFields || [];
      default:
        return inquiries || [];
    }
  }, [selectedCategory, dataWithFields, dataWithoutFields, inquiries]);

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        Cell: ({ value }) => <span>{value}</span>,
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ value }) => <span className="break-words">{value}</span>,
      },
      {
        Header: "Mobile No",
        accessor: "mobileNo",
        Cell: ({ value }) => <span className="break-words">{value}</span>,
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => <span className="break-words">{value}</span>,
      },
      {
        Header: "Resume",
        accessor: "resume",
        Cell: ({ value }) => (
          <div className="flex gap-2 sm:gap-4">
            <a className="text-green-500 hover:text-green-700 transition" href={`/api/careerInquiries/download/${value}`} aria-label="Download resume">
              <Download size={20} />
            </a>
            <button className="text-blue-500 hover:text-blue-700 transition" onClick={() => viewResume(value)} aria-label="View resume">
              <Eye size={20} />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
      {
        Header: "Message",
        accessor: "message",
        Cell: ({ value }) => <span className="break-words">{value}</span>,
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-2 sm:gap-4">
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => {
                setInquiryToDelete(row.original);
                setIsDeleteModalOpen(true);
              }}
              aria-label="Delete inquiry"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data: filteredData,
    },
    useSortBy
  );

  const deleteInquiry = async () => {
    if (!inquiryToDelete) return;
    try {
      await axios.delete(`/api/careerInquiries/deleteCareerInquiries?id=${inquiryToDelete._id}`, { withCredentials: true });
      toast.success(`Inquiry "${inquiryToDelete.name}" deleted successfully!`);
      debouncedFetchInquiryData(searchTerm);
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      const statusCode = error.response?.status ? `(${error.response.status})` : '';
      toast.error(`Failed to delete inquiry ${statusCode}.`);
    } finally {
      setIsDeleteModalOpen(false);
      setInquiryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setInquiryToDelete(null);
  };

  const viewResume = (filename) => {
    window.open(`/api/careerInquiries/view/${filename}`);
  };

  useEffect(() => {
    debouncedFetchInquiryData(searchTerm);
    return () => {
      debouncedFetchInquiryData.cancel();
    };
  }, [debouncedFetchInquiryData, searchTerm]);

  return (
    <div className="p-2 sm:p-4">
      <ToastContainer />
      <h1 className="text-xl md:text-2xl font-bold text-gray-700 font-serif uppercase mb-4">Inquiries</h1>
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 text-sm sm:text-base pr-10"
          aria-label="Search inquiries by name"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
        <div className="rounded bg-gradient-to-r from-red-400 to-red-600 p-4 flex justify-between items-center">
          <h3 className="font-semibold text-xl sm:text-2xl md:text-3xl text-white font-serif">All</h3>
          <span className="font-bold text-xl sm:text-2xl md:text-3xl text-black bg-white w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded shadow">{totalCount}</span>
        </div>
        <div className="rounded bg-gradient-to-r from-blue-400 to-blue-600 p-4 flex justify-between items-center">
          <h3 className="font-semibold text-xl sm:text-2xl md:text-3xl text-white font-serif">GPM</h3>
          <span className="font-bold text-xl sm:text-2xl md:text-3xl text-black bg-white w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded shadow">{countWithFields}</span>
        </div>
        <div className="rounded bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 flex justify-between items-center">
          <h3 className="font-semibold text-xl sm:text-2xl md:text-3xl text-white font-serif">SEO</h3>
          <span className="font-bold text-xl sm:text-2xl md:text-3xl text-black bg-white w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded shadow">{countWithoutFields}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 mb-4">
        <h2 className="text-md sm:text-lg font-semibold font-serif">Manage Inquiries</h2>
        <div className="relative w-full sm:w-32 mt-2 sm:mt-0">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="block w-full appearance-none bg-white border border-gray-300 rounded-md py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 text-sm sm:text-base"
            aria-label="Filter inquiries by category"
          >
            <option value="All">All</option>
            <option value="GPM">GPM</option>
            <option value="SEO">SEO</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 14.707a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L9 12.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4z" />
            </svg>
          </div>
        </div>
      </div>
      {loadings ? (
        <div className="flex justify-center"><UseAnimations animation={loading} size={56} /></div>
      ) : (
        <>
          {filteredData.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64">
              <iframe className="w-64 h-64 sm:w-96 sm:h-96" src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json"></iframe>
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900 transition duration-300 font-serif text-sm sm:text-base"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="overflow-auto max-h-[60vh]">
              <table className="w-full mt-4 border-collapse min-w-[640px]" {...getTableProps()}>
                <thead className="bg-slate-700 hover:bg-slate-800 text-white sticky top-0 z-10">
                  {headerGroups.map((headerGroup) => (
                    <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          key={column.id}
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className="py-2 px-2 sm:px-4 border-b border-gray-300 cursor-pointer uppercase font-serif text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                          <div className="flex items-center gap-2">
                            <span>{column.render("Header")}</span>
                            {column.canSort && (
                              <span className="ml-1">
                                {column.isSorted ? (
                                  column.isSortedDesc ? (
                                    <ArrowDown size={16} />
                                  ) : (
                                    <ArrowUp size={16} />
                                  )
                                ) : (
                                  <ArrowDown size={16} className="text-gray-400" />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    return (
                      <tr key={row.id} {...row.getRowProps()} className="border-b border-gray-300 hover:bg-gray-100 transition duration-150">
                        {row.cells.map((cell) => (
                          <td key={cell.id} {...cell.getCellProps()} className="py-2 px-2 sm:px-4 text-xs sm:text-sm md:text-base break-words">
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={deleteInquiry}
        itemName={inquiryToDelete?.name || 'inquiry'}
        itemType="inquiry"
      />
    </div>
  );
};

export default CareerInquiryTable;
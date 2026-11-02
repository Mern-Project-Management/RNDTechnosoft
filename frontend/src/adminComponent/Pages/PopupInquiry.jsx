import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaTrashAlt, FaArrowUp, FaArrowDown, FaEye } from "react-icons/fa";
import axios from 'axios';
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";
import InquiryTabs from "../InquiryTabs";

const Inquiry = () => {
  const [data, setData] = useState({
    careerInquiries: [],
    inquiries: [],
    newsletters: [],
    popupInquiries: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [careerInquiriesCount, setCareerInquiriesCount] = useState(0);
  const [gpmCount, setGpmCount] = useState(0);
  const [seoCount, setSeoCount] = useState(0);
  const itemsPerPage = 20;
  const [pendingDelete, setPendingDelete] = useState(null); // Add this state

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/all-inquiries/inquiries`, { withCredentials: true });
      const responseData = response.data || {};
      console.log('API Response:', responseData);
      const newData = {
        careerInquiries: responseData.careerInquiries || [],
        inquiries: responseData.inquiries || [],
        newsletters: responseData.newsletters || [],
        popupInquiries: responseData.popupInquiries || [],
      };
      setData(newData);

      setTotalCount(responseData.totalCount || [
        ...newData.careerInquiries,
        ...newData.inquiries,
        ...newData.newsletters,
        ...newData.popupInquiries
      ].length);

      setCareerInquiriesCount(responseData.careerInquiriesCount || 0);
      setGpmCount(responseData.gpmCount || 0);
      setSeoCount(responseData.seoCount || 0);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    let selectedData = [];
    switch (selectedCategory) {
      case "Career":
        selectedData = data.careerInquiries;
        break;
      case "Inquiries":
        selectedData = data.inquiries;
        break;
      case "Newsletters":
        selectedData = data.newsletters;
        break;
      case "Popup":
        selectedData = data.popupInquiries;
        break;
      default:
        selectedData = [
          ...data.careerInquiries,
          ...data.inquiries,
          ...data.newsletters,
          ...data.popupInquiries,
        ];
    }

    if (searchTerm) {
      return selectedData.filter(item =>
        (item.name || item.firstname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return selectedData;
  }, [selectedCategory, data, searchTerm]);
    // Add this function to handle confirmation
const confirmDelete = async () => {
  if (pendingDelete) {
    await deleteInquiry(pendingDelete.id, pendingDelete.category);
    setPendingDelete(null);
  }
};

// Add this function to handle cancel
const cancelDelete = () => setPendingDelete(null);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "_id",
        Cell: ({ row }) => {
          if (!row) {
            console.error("Row is undefined in ID column Cell");
            return <div>N/A</div>;
          }
          return <div>{(currentPage - 1) * itemsPerPage + row.index + 1}</div>;
        },
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) => (
          <div>{row.original.name || row.original.firstname || "N/A"}</div>
        ),
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => <div>{value || "N/A"}</div>,
      },
      {
        Header: "Mobile No",
        accessor: "mobileNo",
        Cell: ({ value, row }) => <div>{value || row.original.phone || "N/A"}</div>,
      },
      // {
      //   Header: "Subject",
      //   accessor: "subject",
      //   Cell: ({ value }) => <div>{value || "N/A"}</div>,
      // },
      {
        Header: "Category",
        accessor: "category",
        Cell: ({ row }) => {
          if (data.careerInquiries.includes(row.original)) return "Career";
          if (data.inquiries.includes(row.original)) return "Inquiry";
          if (data.newsletters.includes(row.original)) return "Newsletter";
          if (data.popupInquiries.includes(row.original)) return "Popup";
          return "N/A";
        },
      },
      // {
      //   Header: "PM Assigned",
      //   accessor: "assignedPM",
      //   Cell: ({ row }) => (
      //     <div>{row.original.assignedPM || row.original.pmStatus || "Unassigned"}</div>
      //   ),
      // },
      // {
      //   Header: "Source",
      //   accessor: "source",
      //   Cell: ({ row }) => <div>{row.original.source || "N/A"}</div>,
      // },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-4">
            <button
              className="text-blue-500 hover:text-blue-700 transition"
              onClick={() => {
                setSelectedInquiry(row.original);
                setShowModal(true);
              }}
            >
              <FaEye />
            </button>
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => {
                const category = data.careerInquiries.includes(row.original) ? 'Career' :
                  data.inquiries.includes(row.original) ? 'Inquiry' :
                    data.newsletters.includes(row.original) ? 'Newsletter' :
                      data.popupInquiries.includes(row.original) ? 'Popup' : 'N/A';
                setPendingDelete({ id: row.original._id, category });
              }}
            >
              <FaTrashAlt />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    [data, currentPage]
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
      data: paginatedData,
    },
    useSortBy
  );

  const deleteInquiry = async (id, category) => {
    try {
      let endpoint;
      switch (category) {
        case 'Career':
          endpoint = `/api/careerInquiries/deleteCareerInquiries?id=${id}`;
          break;
        case 'Inquiry':
          endpoint = `/api/inquiry/deleteInquiries?id=${id}`;
          break;
        case 'Newsletter':
          endpoint = `/api/newsletter/deleteNewsletters?id=${id}`;
          break;
        case 'Popup':
          endpoint = `/api/popupinquiry/deletePopupInquiries?id=${id}`;
          break;
        default:
          throw new Error('Unknown category');
      }
      await axios.delete(endpoint, { withCredentials: true });
      fetchData();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInquiry(null);
  };

  const renderInquiryDetails = () => {
    if (!selectedInquiry) return null;

    const excludedFields = ['__v', 'updatedAt', 'createdAt'];
    const fields = Object.entries(selectedInquiry).filter(
      ([key]) => !excludedFields.includes(key)
    );


    return (
      <div className="grid grid-cols-1 gap-4">
        {fields.map(([key, value]) => (
          <div key={key} className="flex items-center">
            <span className="font-semibold text-gray-700 capitalize w-1/3">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="text-gray-600">
              {value && typeof value === 'object'
                ? JSON.stringify(value)
                : value?.toString() || 'N/A'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 overflow-x-auto">
      <h1 className="text-xl font-bold text-gray-700 font-serif uppercase mb-4">Popup Inquiries</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 gap-6 mt-8">
        <div className="rounded bg-gradient-to-r from-red-400 to-red-600 p-4 flex justify-between items-center px-12">
          <h3 className="font-semibold text-[35px] text-white font-serif">All</h3>
          <button className="font-bold text-[30px] text-black bg-white w-16 h-16 flex items-center justify-center rounded shadow">
            {totalCount}
          </button>
        </div>
        <div className="rounded bg-gradient-to-r from-blue-400 to-blue-600 p-4 flex justify-between items-center px-12">
          <h3 className="font-semibold text-[35px] text-white font-serif">Career</h3>
          <p className="font-bold text-[30px] text-black bg-white w-16 h-16 flex items-center justify-center rounded shadow">
            {careerInquiriesCount}
          </p>
        </div>
        <div className="rounded bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 flex justify-between items-center px-12">
          <h3 className="font-semibold text-[35px] text-white font-serif">Inquiries</h3>
          <p className="font-bold text-[30px] text-black bg-white w-16 h-16 flex items-center justify-center rounded shadow">
            {data.inquiries.length}
          </p>
        </div>
        <div className="rounded bg-gradient-to-r from-green-400 to-green-600 p-4 flex justify-between items-center px-12">
          <h3 className="font-semibold text-[35px] text-white font-serif">Newsletters</h3>
          <p className="font-bold text-[30px] text-black bg-white w-16 h-16 flex items-center justify-center rounded shadow">
            {data.newsletters.length}
          </p>
        </div>
        <div className="rounded bg-gradient-to-r from-purple-400 to-purple-600 p-4 flex justify-between items-center px-12">
          <h3 className="font-semibold text-[35px] text-white font-serif">GPM</h3>
          <p className="font-bold text-[30px] text-black bg-white w-16 h-16 flex items-center justify-center rounded shadow">
            {gpmCount}
          </p>
        </div>
        <div className="rounded bg-gradient-to-r from-orange-400 to-orange-600 p-4 flex justify-between items-center px-12">
          <h3 className="font-semibold text-[35px] text-white font-serif">SEO</h3>
          <p className="font-bold text-[30px] text-black bg-white w-16 h-16 flex items-center justify-center rounded shadow">
            {seoCount}
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <h2 className="text-md font-semibold mb-4">Manage Inquiries</h2>
        <div className="relative w-[3cm]">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="block w-full appearance-none bg-white border border-gray-300 rounded-md py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
          >
            <option value="All">All</option>
            <option value="Career">Career</option>
            <option value="Inquiries">Inquiries</option>
            <option value="Newsletters">Newsletters</option>
            <option value="Popup">Popup</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 14.707a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L9 12.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4z" />
            </svg>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center"><UseAnimations animation={loading} size={56} /></div>
      ) : (
        <>
          {filteredData.length === 0 ? (
            <div className="flex justify-center items-center">
              <iframe className="w-96 h-96" src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json"></iframe>
            </div>
          ) : (
            <>
              <table className="w-full mt-4 border-collapse" {...getTableProps()}>
                <thead className="bg-slate-700 hover:bg-slate-800 text-white">
                  {headerGroups.map((headerGroup) => {
                    const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                    return (
                      <tr key={key} {...headerGroupProps}>
                        {headerGroup.headers.map((column) => {
                          const { key: columnKey, ...columnProps } = column.getHeaderProps(column.getSortByToggleProps());
                          return (
                            <th key={columnKey} {...columnProps} className="py-2 px-4 border-b border-gray-300 cursor-pointer">
                              <div className="flex items-center uppercase font-serif gap-2">
                                <span>{column.render("Header")}</span>
                                {column.canSort && (
                                  <span className="ml-1">
                                    {column.isSorted ? (
                                      column.isSortedDesc ? (
                                        <FaArrowDown />
                                      ) : (
                                        <FaArrowUp />
                                      )
                                    ) : (
                                      <FaArrowDown className="text-gray-400" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    );
                  })}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    const { key, ...rowProps } = row.getRowProps();
                    return (
                      <tr key={key} {...rowProps} className="border-b border-gray-300 hover:bg-gray-100 transition duration-150">
                        {row.cells.map((cell) => {
                          const { key: cellKey, ...cellProps } = cell.getCellProps();
                          return (
                            <td key={cellKey} {...cellProps} className="py-2 px-4">
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4 flex justify-between items-center">
                <div>
                  Showing {((currentPage - 1) * itemsPerPage + 1)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-md ${currentPage === page ? "bg-blue-500 text-white" : ""
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
{/* // Add this modal just before the closing </div> of your main return */}
{pendingDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Confirm Deletion</h2>
      <p className="mb-6 text-gray-700">Are you sure you want to delete this inquiry?</p>
      <div className="flex justify-end gap-4">
        <button
          onClick={cancelDelete}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-700">Inquiry Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {renderInquiryDetails()}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiry;
import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaTrashAlt, FaArrowUp, FaArrowDown, FaSearch } from "react-icons/fa";
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAnimations from "react-useanimations";
import loadingAnim from "react-useanimations/lib/loading";
import InquiryTabs from "../InquiryTabs";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const Inquiry = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [totalCount, setTotalCount] = useState(0);
  const [countWithFields, setCountWithFields] = useState(0);
  const [countWithoutFields, setCountWithoutFields] = useState(0);
  const [dataWithFields, setDataWithFields] = useState([]);
  const [dataWithoutFields, setDataWithoutFields] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/inquiries/getInquiries', { withCredentials: true });
      const {
        totalCount = 0,
        countWithFields = 0,
        countWithoutFields = 0,
        dataWithFields = [],
        dataWithoutFields = [],
        inquiries = [],
      } = response.data || {};

      setTotalCount(totalCount);
      setCountWithFields(countWithFields);
      setCountWithoutFields(countWithoutFields);
      setDataWithFields(Array.isArray(dataWithFields) ? dataWithFields : []);
      setDataWithoutFields(Array.isArray(dataWithoutFields) ? dataWithoutFields : []);
      setInquiries(Array.isArray(inquiries) ? inquiries : []);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      setError(`Failed to fetch inquiries: ${msg}`);
      toast.error(`Failed to fetch inquiries: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const confirmDelete = async () => {
    if (!selectedItem?._id) {
      toast.error("No inquiry selected for deletion");
      setIsModalOpen(false);
      return;
    }
    try {
      await axios.delete(`/api/inquiries/deleteInquiries?id=${selectedItem._id}`, { withCredentials: true });
      toast.success("Inquiry deleted successfully!");
      await fetchData();
    } catch (err) {
      console.error("Error deleting inquiry:", err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      toast.error(`Failed to delete inquiry: ${msg}`);
    } finally {
      setIsModalOpen(false);
      setSelectedItem(null);
    }
  };

  // Filter by category AND search keyword
  const filteredData = useMemo(() => {
    let baseData = [];
    switch (selectedCategory) {
      case "GPM":
        baseData = dataWithFields;
        break;
      case "SEO":
        baseData = dataWithoutFields;
        break;
      default:
        baseData = inquiries;
    }

    if (!Array.isArray(baseData)) return [];
    if (!searchTerm.trim()) return baseData;

    const term = searchTerm.toLowerCase().trim();
    return baseData.filter((item) => {
      const fn = (item.firstname || "").toLowerCase();
      const ln = (item.lastname || "").toLowerCase();
      const fullName = `${fn} ${ln}`.trim();
      const email = (item.email || "").toLowerCase();
      const phone = (item.mobileNo || item.phone || "").toLowerCase();
      const comp = (item.companysize || "").toLowerCase();
      const topic = (item.topic || "").toLowerCase();
      const msg = (item.message || "").toLowerCase();

      return (
        fullName.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        comp.includes(term) ||
        topic.includes(term) ||
        msg.includes(term)
      );
    });
  }, [selectedCategory, dataWithFields, dataWithoutFields, inquiries, searchTerm]);

  const columns = useMemo(
    () => [
      {
        Header: "#",
        accessor: "_id",
        Cell: ({ row }) => (
          <span className="font-semibold text-gray-500">{row.index + 1}</span>
        ),
        disableSortBy: true,
      },
      {
        Header: "Name",
        accessor: "firstname",
        Cell: ({ row }) => {
          const fn = row.original.firstname || "";
          const ln = row.original.lastname || "";
          const full = `${fn} ${ln}`.trim() || row.original.name || "-";
          return (
            <div className="font-medium text-gray-900">{full}</div>
          );
        },
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
            {value || "-"}
          </a>
        ),
      },
      {
        Header: "Mobile No",
        accessor: "mobileNo",
        Cell: ({ row }) => row.original.mobileNo || row.original.phone || "-",
      },
      {
        Header: "Company Size",
        accessor: "companysize",
        Cell: ({ value }) => (
          <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-medium">
            {value || "N/A"}
          </span>
        ),
      },
      {
        Header: "Active Users",
        accessor: "activeuser",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Topic",
        accessor: "topic",
        Cell: ({ value }) => (
          <span className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
            {value || "General"}
          </span>
        ),
      },
      {
        Header: "Message",
        accessor: "message",
        Cell: ({ value }) => (
          <div className="max-w-xs break-words text-gray-600 text-xs">
            {value || "-"}
          </div>
        ),
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              type="button"
              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors duration-150"
              title="Delete this inquiry"
              onClick={() => handleDeleteClick(row.original)}
            >
              <FaTrashAlt size={16} />
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

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-96">
        <UseAnimations animation={loadingAnim} size={56} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <ToastContainer />
        <InquiryTabs />
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <InquiryTabs />

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 p-5 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-red-100 font-semibold">Total Inquiries</p>
            <h3 className="text-3xl font-extrabold mt-1">{totalCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xl text-white">
            {totalCount}
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-5 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-blue-100 font-semibold">GPM (Paid Ads)</p>
            <h3 className="text-3xl font-extrabold mt-1">{countWithFields}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xl text-white">
            {countWithFields}
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 p-5 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-amber-100 font-semibold">SEO (Organic)</p>
            <h3 className="text-3xl font-extrabold mt-1">{countWithoutFields}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xl text-white">
            {countWithoutFields}
          </div>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, topic, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter Source:</span>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
          >
            <option value="All">All Sources</option>
            <option value="GPM">GPM (Paid Ads)</option>
            <option value="SEO">SEO (Organic)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">No inquiries found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse" {...getTableProps()}>
              <thead>
                {headerGroups.map((headerGroup) => {
                  const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                  return (
                    <tr key={key} {...headerGroupProps} className="bg-slate-800 text-white">
                      {headerGroup.headers.map((column) => {
                        const { key: colKey, ...colProps } = column.getHeaderProps(column.getSortByToggleProps());
                        return (
                          <th
                            key={colKey}
                            {...colProps}
                            className="py-3 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:bg-slate-700 transition"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{column.render("Header")}</span>
                              {column.canSort && (
                                <span className="text-xs">
                                  {column.isSorted ? (
                                    column.isSortedDesc ? (
                                      <FaArrowDown className="text-blue-400" />
                                    ) : (
                                      <FaArrowUp className="text-blue-400" />
                                    )
                                  ) : (
                                    <FaArrowDown className="text-gray-500" />
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
              <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 text-sm">
                {rows.map((row) => {
                  prepareRow(row);
                  const { key, ...rowProps } = row.getRowProps();
                  return (
                    <tr
                      key={key}
                      {...rowProps}
                      className="hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      {row.cells.map((cell) => {
                        const { key: cellKey, ...cellProps } = cell.getCellProps();
                        return (
                          <td key={cellKey} {...cellProps} className="py-3.5 px-4 text-gray-700">
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={confirmDelete}
        itemType="inquiry"
        itemName={
          selectedItem
            ? `${selectedItem.firstname || selectedItem.name || ''} (${selectedItem.email || 'Inquiry'})`
            : 'Inquiry'
        }
      />
    </div>
  );
};

export default Inquiry;

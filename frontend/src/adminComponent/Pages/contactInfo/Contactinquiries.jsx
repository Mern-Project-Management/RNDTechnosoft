import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaArrowUp, FaArrowDown } from "react-icons/fa";
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import InquiryTabs from "../../InquiryTabs";

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
      const response = await axios.get(`/api/contactinquiries/getcontactInquiries`, { withCredentials: true });
      console.log("fetchData response:", response.data); // Debug log
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
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      const statusCode = error.response?.status ? `(${error.response.status})` : '';
      const message = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Failed to fetch inquiries: ${message} ${statusCode}`);
      toast.error(`Failed to fetch inquiries: ${message} ${statusCode}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteInquiry = async () => {
    if (!selectedItem?._id) {
      toast.error("No inquiry selected for deletion");
      setIsModalOpen(false);
      return;
    }
    try {
      await axios.delete(`/api/contactinquiries/deletecontactInquiries?id=${selectedItem._id}`, { withCredentials: true });
      toast.success("Inquiry deleted successfully!");
      await fetchData();
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      const statusCode = error.response?.status ? `(${error.response.status})` : '';
      const message = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Failed to delete inquiry: ${message} ${statusCode}`);
    } finally {
      setIsModalOpen(false);
      setSelectedItem(null);
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

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const filteredData = useMemo(() => {
    let data;
    switch (selectedCategory) {
      case "GPM":
        data = dataWithFields;
        break;
      case "SEO":
        data = dataWithoutFields;
        break;
      default:
        data = inquiries;
    }
    if (!Array.isArray(data)) return [];
    if (!searchTerm) return data;
    return data.filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedCategory, dataWithFields, dataWithoutFields, inquiries, searchTerm]);

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        Cell: ({ row }) => <div>{row?.index + 1}</div>,
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Mobile No",
        accessor: "phone",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Subject",
        accessor: "subject",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Message",
        accessor: "message",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-4">
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => handleDeleteClick(row?.original)}
            >
              <FaTrashAlt size={20} />
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
      <div className="container mx-auto p-4 flex justify-center items-center h-screen">
        <UseAnimations animation={loading} size={56} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <ToastContainer />
      <InquiryTabs />
        <div className="text-red-500 font-serif text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 overflow-x-auto">
      <ToastContainer />
      <h1 className="text-xl font-bold text-gray-700 font-serif uppercase mb-4">Inquiries</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
        />
      </div>
      <div className="grid grid-cols-3 gap-12 mt-8">
        <div className="rounded bg-gradient-to-r from-red-400 to-red-600 p-4 flex justify-between items-center px-12">
          <h3 className="font-semibold text-[45px] text-white font-serif">All</h3>
          <button className="font-bold text-[40px] text-black bg-white w-16 h-16 flex items-center justify-center rounded shadow">{totalCount}</button>
        </div>
        <div className="rounded bg-gradient-to-r from-blue-400 to-blue-600 p-4 flex justify-between items-center px-12">
          <h3 className="font-semibold text-[45px] text-white font-serif">GPM</h3>
          <p className="font-bold text-[40px] text-black bg-white w-16 h-16 flex items-center justify-center rounded shadow">{countWithFields}</p>
        </div>
        <div className="rounded bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 flex justify-between items-center px-12">
          <h3 className="font-semibold text-[45px] text-white font-serif">SEO</h3>
          <p className="font-bold text-[40px] text-black bg-white w-16 h-16 flex items-center justify-center rounded shadow">{countWithoutFields}</p>
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <h2 className="text-md font-semibold mb-4 font-serif">Manage Inquiries</h2>
        <div className="relative w-[3cm]">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="block w-full appearance-none bg-white border border-gray-300 rounded-md py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
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
      {filteredData.length === 0 ? (
        <div className="flex justify-center items-center mt-8">
          <p className="text-gray-500 font-serif text-lg">No inquiries available. Check back later or refresh the page.</p>
        </div>
      ) : (
        <table className="w-full mt-4 border-collapse" {...getTableProps()}>
          <thead className="bg-slate-700 text-white">
            {headerGroups.map((headerGroup, hgIdx) => (
              <tr key={hgIdx} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, colIdx) => (
                  <th
                    key={column.id || colIdx}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="py-2 px-4 border-b border-gray-300 cursor-pointer uppercase font-serif"
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.render("Header")}</span>
                      {column.canSort && (
                        <span className="ml-1">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <FaArrowDown size={16} />
                            ) : (
                              <FaArrowUp size={16} />
                            )
                          ) : (
                            <FaArrowDown size={16} className="text-gray-400" />
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
                <tr key={row.id || row.index} {...row.getRowProps()} className="border-b border-gray-300 hover:bg-gray-100 transition duration-150">
                  {row.cells.map((cell, cellIdx) => (
                    <td key={cell.column.id || cellIdx} {...cell.getCellProps()} className="py-2 px-4">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={deleteInquiry}
        itemName={selectedItem?.email || "this inquiry"}
        itemType="Inquiry"
      />
    </div>
  );
};

export default Inquiry;
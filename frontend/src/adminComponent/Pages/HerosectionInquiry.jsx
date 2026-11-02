import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { 
  Trash2,  // Trash2
  ArrowUp,  // ArrowUp
  ArrowDown,  // ArrowDown
  Phone,
  Mail,
  MapPin
} from "lucide-react";

import axios from "axios";
import UseAnimations from "react-useanimations";
import InquiryTabs from "../InquiryTabs";

const Inquiry = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [totalCount, setTotalCount] = useState(0);
  const [countWithFields, setCountWithFields] = useState(0);
  const [countWithoutFields, setCountWithoutFields] = useState(0);
  const [dataWithFields, setDataWithFields] = useState([]);
  const [dataWithoutFields, setDataWithoutFields] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/herosectioninquiry/getHomesectionInquiries`, {
        withCredentials: true,
      });
      const {
        totalCount,
        countWithFields,
        countWithoutFields,
        dataWithFields,
        dataWithoutFields,
        inquiries,
      } = response.data;

      setTotalCount(totalCount);
      setCountWithFields(countWithFields);
      setCountWithoutFields(countWithoutFields);
      setDataWithFields(dataWithFields);
      setDataWithoutFields(dataWithoutFields);
      setInquiries(inquiries);
    } catch (error) {
      console.error(error);
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
        accessor: "_id",
        Cell: ({ row }) => <div>{row.index + 1}</div>,
      },
      {
        Header: "Info",
        accessor: d => ({
          name: d.name,
          email: d.email,
          phone: d.phone,
          city: d.city
        }),
        Cell: ({ value }) => (
          <div className="space-y-2">
            <div className="font-medium text-gray-900">{value.name}</div>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-blue-500" />
              <span className="truncate">{value.email || 'N/A'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-green-500" />
              <span>{value.phone || 'N/A'}</span>
            </div>
            {value.city && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                <span>{value.city}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        Header: "Service",
        accessor: "service",
      },
      {
        Header: "Budget",
        accessor: "budget",
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-4">
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => deleteInquiry(row.original._id)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: filteredData,
      },
      useSortBy
    );

  const deleteInquiry = async (id) => {
    try {
      await axios.delete(`/api/herosectioninquiry/deleteHomesectionInquiries?id=${id}`, {
        withCredentials: true,
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-gray-700 font-serif uppercase mb-4">
          Inquiries
        </h1>
        
        {/* Search and Filter */}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded bg-gradient-to-r from-red-400 to-red-600 p-4 flex justify-between items-center">
              <h3 className="font-semibold text-2xl md:text-3xl text-white font-serif">
                All
              </h3>
              <span className="font-bold text-2xl md:text-3xl text-black bg-white w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded shadow">
                {totalCount}
              </span>
            </div>
            <div className="rounded bg-gradient-to-r from-blue-400 to-blue-600 p-4 flex justify-between items-center">
              <h3 className="font-semibold text-2xl md:text-3xl text-white font-serif">
                PM
              </h3>
              <span className="font-bold text-2xl md:text-3xl text-black bg-white w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded shadow">
                {countWithFields}
              </span>
            </div>
            <div className="rounded bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 flex justify-between items-center">
              <h3 className="font-semibold text-2xl md:text-3xl text-white font-serif">
                SEO
              </h3>
              <span className="font-bold text-2xl md:text-3xl text-black bg-white w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded shadow">
                {countWithoutFields}
              </span>
            </div>
          </div>

          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <h2 className="text-md font-semibold">Manage Inquiries</h2>
            <div className="relative w-full sm:w-40">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="appearance-none bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 w-full rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
              >
                <option value="All">ALL</option>
                <option value="GPM">PM</option>
                <option value="SEO">SEO</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 14.707a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L9 12.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-8">
              <UseAnimations animation={loading} size={56} />
            </div>
          ) : (
            <>
              {inquiries && inquiries.length === 0 ? (
                <div className="flex justify-center items-center p-8">
                  <iframe
                    className="w-64 h-64 md:w-96 md:h-96"
                    src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json"
                    title="No data animation"
                  ></iframe>
                </div>
              ) : (
                <div className="overflow-x-auto w-full" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                  <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }} {...getTableProps()}>
                    <colgroup>
                      <col style={{ width: '5%' }} /> {/* ID */}
                      <col style={{ width: '30%' }} /> {/* Info */}
                      <col style={{ width: '20%' }} /> {/* Service */}
                      <col style={{ width: '15%' }} /> {/* Budget */}
                      <col style={{ width: '10%' }} /> {/* Options */}
                    </colgroup>
                    <thead className="bg-slate-700 sticky top-0 z-10">
                      {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                          {headerGroup.headers.map((column) => (
                            <th
                              {...column.getHeaderProps(column.getSortByToggleProps())}
                              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                            >
                              <div className="flex items-center gap-1">
                                <span>{column.render("Header")}</span>
                                {column.canSort && (
                                  <span className="ml-1">
                                    {column.isSorted ? (
                                      column.isSortedDesc ? (
                                        <ArrowDown size={14} />
                                      ) : (
                                        <ArrowUp size={14} />
                                      )
                                    ) : (
                                      <ArrowDown className="text-gray-400" size={14} />
                                    )}
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rows.map((row) => {
                        prepareRow(row);
                        return (
                          <tr {...row.getRowProps()} className="hover:bg-gray-50">
                            {row.cells.map((cell) => (
                              <td 
                                {...cell.getCellProps()} 
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                              >
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
        </div>
      </div>
    </div>
  );
};

export default Inquiry;

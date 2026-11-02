"use client"

import { useState, useEffect } from "react"
import { Download, Loader2, Info } from "lucide-react";
import InquiryTabs from "../../adminComponent/InquiryTabs";

export default function JobApplicationsTable() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/jobApplication/getJob")

      if (!response.ok) {
        throw new Error("Failed to fetch job applications")
      }

      const data = await response.json()
      // Only show applications that don't have status "Reject"
      const filteredData = data.filter(app => app.status !== "Rejected")
      setApplications(filteredData)
      setError(null)
    } catch (err) {
      console.error("Error fetching job applications:", err)
      setError("Failed to load job applications. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        const response = await fetch(`/api/jobApplication/deleteJob/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete job application")
        }

        // Refresh the applications list
        fetchApplications()
      } catch (err) {
        console.error("Error deleting job application:", err)
        alert("Failed to delete job application. Please try again.")
      }
    }
  }

  const handleDownload = async (resumeId) => {
    try {
      window.open(`/api/careerInquiries/download/${resumeId}`, "_blank")
    } catch (err) {
      console.error("Error downloading resume:", err)
      alert("Failed to download resume. Please try again.")
    }
  }

  const handleStatusChange = async (id, currentStatus) => {
    // Toggle between "Accept" and "Reject"
    const newStatus = currentStatus === "Accept" ? "Reject" : "Accept"
    
    try {
      const response = await fetch(`/api/jobApplication/UpdateJobById/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update application status")
      }
      
      // If status changed to Reject, remove from the list
      if (newStatus === "Reject") {
        setApplications(applications.filter(app => app.id !== id))
      } else {
        // Update status locally 
        setApplications(applications.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        ))
      }
    } catch (err) {
      console.error("Error updating application status:", err)
      alert("Failed to update application status. Please try again.")
    }
  }

  const openDetailsModal = (application) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedApplication(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg text-gray-700">Loading applications...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <InquiryTabs />
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <p className="text-gray-500">No job applications found.</p>
      </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <InquiryTabs />
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Job Applications</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Position
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Experience
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Current Org
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Expected Salary
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.firstName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.positionApplied}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.totalExperience} years</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.currentOrganisation}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.expectedSalary}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={application.status !== "Rejected"}
                        onChange={() => handleStatusChange(application.id, application.status || "Accepted")}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                   
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDownload(application.resume)}
                        className="text-green-600 hover:text-green-900 transition-colors duration-150"
                        title="Download Resume"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDetailsModal(application)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                        title="View Details"
                      >
                        <Info className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={closeModal}
          onStatusChange={handleStatusChange}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}

// Application Details Modal Component
function ApplicationDetailsModal({ application, onClose, onStatusChange, onDownload }) {
  if (!application) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">
              Application Details
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Personal Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{application.firstName} {application.lastName || ""}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{application.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{application.phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{application.location || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Professional Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position Applied</label>
                  <p className="mt-1 text-sm text-gray-900">{application.positionApplied}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Experience</label>
                  <p className="mt-1 text-sm text-gray-900">{application.totalExperience} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Organization</label>
                  <p className="mt-1 text-sm text-gray-900">{application.currentOrganisation || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Salary</label>
                  <p className="mt-1 text-sm text-gray-900">{application.expectedSalary || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {application.skillsAndExperience && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Skills & Experience
              </h4>
              <p className="text-sm text-gray-900 whitespace-pre-line">{application.skillsAndExperience}</p>
            </div>
          )}

          {application.additionalInfo && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Additional Information
              </h4>
              <p className="text-sm text-gray-900 whitespace-pre-line">{application.additionalInfo}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <label className="mr-3 text-sm font-medium text-gray-700">Application Status:</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={application.status !== "Reject"}
                  onChange={() => onStatusChange(application.id, application.status || "Accept")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {application.status === "Reject" ? "Rejected" : "Accepted"}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => onDownload(application.resume)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
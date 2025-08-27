import React, { useEffect, useState } from "react";
import { approveLeave, getAllLeaves, rejectLeave } from "../../services/leaveService";

function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);

  // State for Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // State for approval and Rejection
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [actionType, setActionType] = useState(""); // 'approve' or 'reject'
  const [commentText, setCommentText] = useState("");

  // View modal state
  const [viewLeave, setViewLeave] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = () => {
    getAllLeaves()
      .then((res) => {
        setLeaves(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Filters the List based on Search input and dropdown value
  const filteredLeaves = leaves.filter((leave) => {
    const employeeName = leave.userName || "";
    const matchesSearch = employeeName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || leave.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleActionClick = (id, type) => {
    setSelectedLeaveId(id);
    setActionType(type);
    setCommentText("");
  };

  // Handles the confirmation of Approve/ Reject with comment
  const handleConfirmAction = () => {
    if (!selectedLeaveId || !actionType) return;

    const apiCall =
      actionType === "approve"
        ? approveLeave(selectedLeaveId, commentText)
        : rejectLeave(selectedLeaveId, commentText);

    apiCall
      .then(() => {
        // Update leaves state to reflect the change
        setLeaves((prevLeaves) =>
          prevLeaves.map((leave) =>
            leave.id === selectedLeaveId
              ? {
                  ...leave,
                  status: actionType === "approve" ? "Approved" : "Rejected",
                  comment: commentText,
                }
              : leave
          )
        );
        setSelectedLeaveId(null);
        setActionType("");
        setCommentText("");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to update leave status.");
      });
  };

  // Cancels the comment box
  const handleCancelAction = () => {
    setSelectedLeaveId(null);
    setActionType("");
    setCommentText("");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        {/* Search By Employee Name */}
        <input
          type="text"
          placeholder="Search by employee name"
          className="border p-2 rounded w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Filter By Status Dropdown */}
        <div>
          <select
            className="border p-2 rounded mr-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">Filter by Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("All");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Leave Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Employee Name</th>
            <th className="border p-2">Leave Type</th>
            <th className="border p-2">From Date</th>
            <th className="border p-2">To Date</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Comment</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeaves.length > 0 ? (
            filteredLeaves.map((leave) => (
              <tr key={leave.id}>
                <td className="border p-2">{leave.id}</td>
                <td className="border p-2">{leave.userName}</td>
                <td className="border p-2">{leave.type}</td>
                <td className="border p-2">{leave.fromDate}</td>
                <td className="border p-2">{leave.toDate}</td>
                <td className="border p-2">{leave.status}</td>
                <td className="border p-2 text-sm italic text-gray-600">
                  {leave.comment}
                </td>
                <td className="border p-2 text-center">
                  {leave.status === "Pending" ? (
                    <>
                      <button
                        className="text-green-600 mr-2 hover:underline"
                        onClick={() => handleActionClick(leave.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleActionClick(leave.id, "reject")}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className="text-blue-600 underline cursor-pointer"
                      onClick={() => setViewLeave(leave)}
                    >
                      View
                    </span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center p-4 text-gray-500 italic">
                No leave requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Comment box for Approve/Reject */}
      {selectedLeaveId && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow-md w-2/3">
          <h3 className="text-lg font-semibold mb-2">
            {actionType === "approve" ? "Approve" : "Reject"} Leave ID #
            {selectedLeaveId}
          </h3>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            rows={3}
            placeholder="Enter comment (e.g., reason for approval/rejection)"
          />
          <div className="flex gap-4">
            <button
              onClick={handleConfirmAction}
              disabled={!commentText.trim()}
              className={`px-4 py-2 text-white rounded ${
                actionType === "approve" ? "bg-green-600" : "bg-red-600"
              } ${!commentText.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Confirm {actionType === "approve" ? "Approval" : "Rejection"}
            </button>
            <button
              onClick={handleCancelAction}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal for Viewing Leave */}
      {viewLeave && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Leave Details</h2>
            <p>
              <strong>ID:</strong> {viewLeave.id}
            </p>
            <p>
              <strong>Name:</strong> {viewLeave.userName}
            </p>
            <p>
              <strong>Leave Type:</strong> {viewLeave.type}
            </p>
            <p>
              <strong>From:</strong> {viewLeave.fromDate}
            </p>
            <p>
              <strong>To:</strong> {viewLeave.toDate}
            </p>
            <p>
              <strong>Status:</strong> {viewLeave.status}
            </p>
            <p>
              <strong>Comment:</strong> {viewLeave.comment}
            </p>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setViewLeave(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagement;

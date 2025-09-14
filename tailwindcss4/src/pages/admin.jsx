import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase.config";

const TABS = ["users", "badges", "achievements", "chapters", "levels", "questions"];
const USER_SUBTABS = ["progress", "userBadges", "userAchievements"];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [data, setData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSubTab, setUserSubTab] = useState("progress");
  const [userSubData, setUserSubData] = useState([]);
  const [editingRecord, setEditingRecord] = useState({});
  const [editingId, setEditingId] = useState(null);

  // ---------------- Fetch Main Collection ----------------
  const fetchData = async (tab) => {
    const snapshot = await getDocs(collection(db, tab));
    setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    if (!selectedUser) fetchData(activeTab);
  }, [activeTab, selectedUser]);

  // ---------------- Main Collection CRUD ----------------
  const addRecord = async (tab) => {
    if (!editingRecord || Object.keys(editingRecord).length === 0) return alert("Fill fields!");
    await addDoc(collection(db, tab), editingRecord);
    setEditingRecord({});
    fetchData(tab);
  };

  const updateRecord = async (tab, id) => {
    await updateDoc(doc(db, tab, id), editingRecord);
    setEditingRecord({});
    setEditingId(null);
    fetchData(tab);
  };

  const deleteRecordById = async (tab, id) => {
    await deleteDoc(doc(db, tab, id));
    fetchData(tab);
  };

  // ---------------- User Subcollection CRUD ----------------
  const fetchUserSubData = async (sub) => {
    if (!selectedUser) return;
    const snapshot = await getDocs(collection(db, "users", selectedUser.id, sub));
    setUserSubData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const addUserSub = async (sub) => {
    if (!editingRecord || Object.keys(editingRecord).length === 0) return alert("Fill fields!");
    await addDoc(collection(db, "users", selectedUser.id, sub), editingRecord);
    setEditingRecord({});
    fetchUserSubData(sub);
  };

  const updateUserSub = async (sub, id) => {
    await updateDoc(doc(db, "users", selectedUser.id, sub, id), editingRecord);
    setEditingRecord({});
    setEditingId(null);
    fetchUserSubData(sub);
  };

  const deleteUserSub = async (sub, id) => {
    await deleteDoc(doc(db, "users", selectedUser.id, sub, id));
    fetchUserSubData(sub);
  };

  // ---------------- Dynamic Form ----------------
  const renderForm = (record = {}, isSub = false) => {
    const keys = Object.keys(record).length ? Object.keys(record) : ["name"];
    return (
      <div className="mb-4 border p-4 rounded bg-gray-50">
        {keys.map((key) => (
          <div key={key} className="mb-2">
            <label className="block font-semibold">{key}</label>
            <input
              className="w-full border px-2 py-1 rounded"
              type="text"
              value={editingRecord[key] || ""}
              onChange={(e) =>
                setEditingRecord({ ...editingRecord, [key]: e.target.value })
              }
            />
          </div>
        ))}
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mr-2"
          onClick={() =>
            editingId
              ? isSub
                ? updateUserSub(userSubTab, editingId)
                : updateRecord(activeTab, editingId)
              : isSub
              ? addUserSub(userSubTab)
              : addRecord(activeTab)
          }
        >
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={() => {
              setEditingId(null);
              setEditingRecord({});
            }}
          >
            Cancel
          </button>
        )}
      </div>
    );
  };

  const renderTable = (rows, isSub = false) => (
    <table className="w-full bg-white shadow rounded mb-4">
      <thead>
        <tr>
          <th className="p-2 border">ID</th>
          <th className="p-2 border">Data</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => (
          <tr key={item.id}>
            <td className="p-2 border">{item.id}</td>
            <td className="p-2 border">
              {Object.entries(item)
                .filter(([key]) => key !== "id")
                .map(([key, val]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {val}
                  </div>
                ))}
            </td>
            <td className="p-2 border">
              <button
                className="bg-blue-500 text-white px-2 py-1 mr-2 rounded"
                onClick={() => {
                  setEditingId(item.id);
                  setEditingRecord({ ...item });
                }}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() =>
                  isSub
                    ? deleteUserSub(userSubTab, item.id)
                    : deleteRecordById(activeTab, item.id)
                }
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
        <ul>
          {TABS.map((tab) => (
            <li
              key={tab}
              className={`p-2 cursor-pointer ${
                activeTab === tab ? "bg-gray-600" : ""
              }`}
              onClick={() => {
                setActiveTab(tab);
                setSelectedUser(null);
                setEditingId(null);
                setEditingRecord({});
              }}
            >
              {tab}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Users Tab */}
        {activeTab === "users" && !selectedUser && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Users</h2>
            {renderForm()}
            {renderTable(data)}
          </div>
        )}

        {/* User Detail */}
        {activeTab === "users" && selectedUser && (
          <div>
            <button
              className="mb-4 bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => {
                setSelectedUser(null);
                setUserSubData([]);
              }}
            >
              Back to Users
            </button>
            <h2 className="text-2xl font-bold mb-4">
              User: {selectedUser.name}
            </h2>

            {/* Subcollection Tabs */}
            <div className="flex gap-4 mb-4">
              {USER_SUBTABS.map((sub) => (
                <button
                  key={sub}
                  className={`px-4 py-2 rounded ${
                    userSubTab === sub
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300"
                  }`}
                  onClick={() => {
                    setUserSubTab(sub);
                    fetchUserSubData(sub);
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>

            {renderForm({}, true)}
            {renderTable(userSubData, true)}
          </div>
        )}

        {/* Non-User Tabs */}
        {activeTab !== "users" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{activeTab}</h2>
            {renderForm()}
            {renderTable(data)}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;


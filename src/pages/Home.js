import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactModal from "react-modal";
import "./Home.css";
import { API_URL, BEARER_TOKEN } from "../config"; // Import the config values
import TableList from "../components/TableList";
import Dialog from "../components/Dialog";

ReactModal.setAppElement("#root");

function Home() {
     const [data, setData] = useState([]);
     const [modalIsOpen, setModalIsOpen] = useState(false);
     const [selectedRecord, setSelectedRecord] = useState(null);
     const [newRecord, setNewRecord] = useState({
          Name: "",
          Color: "",
          Brand: "",
          Model: "",
          Year: "",
          Price: "",
     });
     const [selectedRecords, setSelectedRecords] = useState([]);
     const [errorMessage, setErrorMessage] = useState("");
     const [validationErrors, setValidationErrors] = useState({});

     const [searchTerm, setSearchTerm] = useState("");

     const [sortField, setSortField] = useState("");
     const [sortOrder, setSortOrder] = useState("asc"); // 'asc' for ascending, 'desc' for descending

     const filteredData = data.filter(
          (record) =>
               record.fields.Name.toLowerCase().includes(
                    searchTerm.toLowerCase()
               ) ||
               record.fields.Brand.toLowerCase().includes(
                    searchTerm.toLowerCase()
               ) ||
               record.fields.Color.toLowerCase().includes(
                    searchTerm.toLowerCase()
               )
     );

     // Sort the filtered data based on the current sortField and sortOrder
     const sortedData = [...filteredData].sort((a, b) => {
          if (a.fields[sortField] < b.fields[sortField]) {
               return sortOrder === "asc" ? -1 : 1;
          }
          if (a.fields[sortField] > b.fields[sortField]) {
               return sortOrder === "asc" ? 1 : -1;
          }
          return 0;
     });

     useEffect(() => {
          const fetchData = async () => {
               try {
                    const response = await axios.get(API_URL, {
                         headers: {
                              Authorization: BEARER_TOKEN, // Use the constant instead of hardcoding
                         },
                    });
                    setData(response.data.records);
               } catch (error) {
                    console.error("Error fetching data from Airtable", error);
               }
          };
          fetchData();
     }, []);

     const openModal = (
          record = {
               fields: {
                    Name: "",
                    Color: "",
                    Brand: "",
                    Model: "",
                    Year: "",
                    Price: "",
               },
          }
     ) => {
          setSelectedRecord(record);
          setNewRecord({
               Name: record.fields.Name || "",
               Color: record.fields.Color || "",
               Brand: record.fields.Brand || "",
               Model: record.fields.Model || "",
               Year: record.fields.Year || "",
               Price: record.fields.Price || "",
          });
          setModalIsOpen(true);
     };

     const closeModal = () => {
          setModalIsOpen(false);
          setSelectedRecord(null);
          setNewRecord({
               Name: "",
               Color: "",
               Brand: "",
               Model: "",
               Year: "",
               Price: "",
          });
     };

     const handleCreateRecord = async () => {
          if (!validateFields()) {
               return; // Don't submit if there are validation errors
          }
          try {
               const response = await axios.post(
                    API_URL, // Use the constant for the URL
                    {
                         records: [
                              {
                                   fields: {
                                        ...newRecord,
                                        Price: Number(newRecord.Price), // Ensure Price is sent as a number
                                   },
                              },
                         ],
                    },
                    {
                         headers: {
                              Authorization: BEARER_TOKEN, // Use the constant for the Bearer token
                         },
                    }
               );
               setData([...data, response.data.records[0]]);
               closeModal();
          } catch (error) {
               console.error("Error creating new record", error);
          }
     };

     const handleUpdateRecord = async () => {
          if (!validateFields()) {
               return; // Don't submit if there are validation errors
          }

          try {
               const response = await axios.patch(
                    `${API_URL}/${selectedRecord.id}`, // PATCH request with the correct URL structure
                    {
                         fields: {
                              ...newRecord,
                              Price: Number(newRecord.Price), // Ensure Price is sent as a number
                         },
                    },
                    {
                         headers: {
                              Authorization: BEARER_TOKEN,
                         },
                    }
               );

               // Update the data with the modified record
               const updatedRecords = data.map((record) =>
                    record.id === selectedRecord.id ? response.data : record
               );
               setData(updatedRecords);
               closeModal();
          } catch (error) {
               console.error("Error updating record", error);
          }
     };

     const handleDeleteRecords = async () => {
          if (selectedRecords.length === 0) {
               setErrorMessage("Please select at least one record"); // Set the error message
               return;
          }

          // Show a confirmation dialog
          const confirmed = window.confirm(
               "Are you sure you want to delete the selected records?"
          );

          if (!confirmed) {
               return; // Do nothing if the user cancels the action
          }

          setErrorMessage(""); // Clear the error message

          const recordIds = selectedRecords
               .map((id) => `records[]=${id}`)
               .join("&");

          try {
               await axios.delete(`${API_URL}?${recordIds}`, {
                    headers: {
                         Authorization: BEARER_TOKEN, // Use the constant for the Bearer token
                    },
               });
               setData(
                    data.filter(
                         (record) => !selectedRecords.includes(record.id)
                    )
               );
               setSelectedRecords([]);
          } catch (error) {
               console.error("Error deleting records", error);
          }
     };

     const handleSort = (field) => {
          const order =
               sortField === field && sortOrder === "asc" ? "desc" : "asc";
          setSortField(field);
          setSortOrder(order);
     };

     const toggleRecordSelection = (id) => {
          setErrorMessage(""); // Clear the error message on selection change
          if (selectedRecords.includes(id)) {
               setSelectedRecords(
                    selectedRecords.filter((recordId) => recordId !== id)
               );
          } else {
               setSelectedRecords([...selectedRecords, id]);
          }
     };

     const validateFields = () => {
          const errors = {};
          const currentYear = new Date().getFullYear();

          if (!newRecord.Name) errors.Name = "Name is required";
          if (!newRecord.Color) errors.Color = "Color is required";
          if (!newRecord.Brand) errors.Brand = "Brand is required";
          if (!newRecord.Model) errors.Model = "Model is required";
          if (!newRecord.Price) {
               errors.Price = "Price is required";
          } else if (isNaN(newRecord.Price) || Number(newRecord.Price) < 0) {
               errors.Price =
                    "Price must be a number greater than or equal to 0";
          }

          // Validate Year (between 1900 and current year)
          if (!newRecord.Year) {
               errors.Year = "Year is required";
          } else if (
               isNaN(newRecord.Year) ||
               newRecord.Year < 1900 ||
               newRecord.Year > currentYear
          ) {
               errors.Year = `Year must be between 1900 and ${currentYear}`;
          }

          setValidationErrors(errors);

          // If there are no errors, return true, else false
          return Object.keys(errors).length === 0;
     };

     return (
          <div className="home-container">
               <h2>Car List</h2>

               <div className="actions-box">
                    <button onClick={() => openModal()}>Create New Car</button>
                    <button onClick={handleDeleteRecords}>
                         Delete Selected
                    </button>
               </div>

               {/* Error message */}
               {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
               )}

               <div className="record-count">Total Records: {data.length}</div>

               <input
                    type="text"
                    placeholder="Search cars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
               />

               <TableList
                    sortField={sortField}
                    handleSort={handleSort}
                    sortOrder={sortOrder}
                    sortedData={sortedData}
                    selectedRecords={selectedRecords}
                    openModal={openModal}
                    toggleRecordSelection={toggleRecordSelection}
               ></TableList>

               {selectedRecord && (
                    <Dialog
                         modalIsOpen={modalIsOpen}
                         closeModal={closeModal}
                         selectedRecord={selectedRecord}
                         newRecord={newRecord}
                         setNewRecord={setNewRecord}
                         validationErrors={validationErrors}
                         handleUpdateRecord={handleUpdateRecord}
                         handleCreateRecord={handleCreateRecord}
                    ></Dialog>
               )}
          </div>
     );
}

export default Home;
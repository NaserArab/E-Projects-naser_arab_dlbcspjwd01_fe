import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import './Home.css';
import { API_URL, BEARER_TOKEN } from '../config';  // Import the config values

ReactModal.setAppElement('#root');

function Home() {
  const [data, setData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({ Name: '', Color: '', Brand: '', Model: '', Year: '',Price: '' });
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [searchTerm, setSearchTerm] = useState('');

  const [sortField, setSortField] = useState('');
const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for ascending, 'desc' for descending


const filteredData = data.filter(record => 
  record.fields.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  record.fields.Brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
  record.fields.Color.toLowerCase().includes(searchTerm.toLowerCase())
);

// Sort the filtered data based on the current sortField and sortOrder
const sortedData = [...filteredData].sort((a, b) => {
  if (a.fields[sortField] < b.fields[sortField]) {
    return sortOrder === 'asc' ? -1 : 1;
  }
  if (a.fields[sortField] > b.fields[sortField]) {
    return sortOrder === 'asc' ? 1 : -1;
  }
  return 0;
});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: BEARER_TOKEN,  // Use the constant instead of hardcoding
          },
        });
        setData(response.data.records);
      } catch (error) {
        console.error("Error fetching data from Airtable", error);
      }
    };
    fetchData();
  }, []);

  const openModal = (record = { fields: { Name: '', Color: '', Brand: '', Model: '', Year: '',Price: '' } }) => {
    setSelectedRecord(record);
    setNewRecord({
      Name: record.fields.Name || '',
      Color: record.fields.Color || '',
      Brand: record.fields.Brand || '',
      Model: record.fields.Model || '',
      Year: record.fields.Year || '',
      Price: record.fields.Price || '',
    });
    setModalIsOpen(true);
  };
  

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedRecord(null);
    setNewRecord({ Name: '', Color: '', Brand: '', Model: '', Year: '',Price: '' });
  };

  const handleCreateRecord = async () => {
    if (!validateFields()) {
      return; // Don't submit if there are validation errors
    }
    try {
      const response = await axios.post(
        API_URL,  // Use the constant for the URL
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
            Authorization: BEARER_TOKEN,  // Use the constant for the Bearer token
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
      setErrorMessage('Please select at least one record'); // Set the error message
      return;
    }
  
    // Show a confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete the selected records?');
    
    if (!confirmed) {
      return; // Do nothing if the user cancels the action
    }
  
    setErrorMessage(''); // Clear the error message
  
    const recordIds = selectedRecords.map((id) => `records[]=${id}`).join('&');
  
    try {
      await axios.delete(`${API_URL}?${recordIds}`, {
        headers: {
          Authorization: BEARER_TOKEN,  // Use the constant for the Bearer token
        },
      });
      setData(data.filter((record) => !selectedRecords.includes(record.id)));
      setSelectedRecords([]);
    } catch (error) {
      console.error("Error deleting records", error);
    }
  };
  

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };
  

  const toggleRecordSelection = (id) => {
    setErrorMessage(''); // Clear the error message on selection change
    if (selectedRecords.includes(id)) {
      setSelectedRecords(selectedRecords.filter((recordId) => recordId !== id));
    } else {
      setSelectedRecords([...selectedRecords, id]);
    }
  };

  const validateFields = () => {
    const errors = {};
    const currentYear = new Date().getFullYear();
  
    if (!newRecord.Name) errors.Name = 'Name is required';
    if (!newRecord.Color) errors.Color = 'Color is required';
    if (!newRecord.Brand) errors.Brand = 'Brand is required';
    if (!newRecord.Model) errors.Model = 'Model is required';
    if (!newRecord.Price) {
      errors.Price = 'Price is required';
    } else if (isNaN(newRecord.Price) || Number(newRecord.Price) < 0) {
      errors.Price = 'Price must be a number greater than or equal to 0';
    }
    
  
    // Validate Year (between 1900 and current year)
    if (!newRecord.Year) {
      errors.Year = 'Year is required';
    } else if (isNaN(newRecord.Year) || newRecord.Year < 1900 || newRecord.Year > currentYear) {
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
        <button onClick={handleDeleteRecords}>Delete Selected</button>
      </div>

      {/* Error message */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="record-count">
        Total Records: {data.length}
      </div>

      <input
  type="text"
  placeholder="Search cars..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="search-bar"
/>

<table className="data-table">
  <thead>
    <tr>
      <th></th> {/* Checkbox column */}
      <th onClick={() => handleSort('Name')}>Name {sortField === 'Name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
      <th onClick={() => handleSort('Color')}>Color {sortField === 'Color' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
      <th onClick={() => handleSort('Brand')}>Brand {sortField === 'Brand' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
      <th onClick={() => handleSort('Model')}>Model {sortField === 'Model' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
      <th onClick={() => handleSort('Year')}>Year {sortField === 'Year' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
      <th onClick={() => handleSort('Price')}>Price {sortField === 'Price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
      <th>Created Time</th>
      <th>Details</th>
    </tr>
  </thead>
  <tbody>
    {sortedData.length === 0 ? (
      <tr>
        <td colSpan="9">No data available</td>
      </tr>
    ) : (
      sortedData.map((record) => (
        <tr key={record.id} onDoubleClick={() => openModal(record)} style={{ cursor: 'pointer' }}>
          <td className="checkbox-cell">
            <input
              type="checkbox"
              checked={selectedRecords.includes(record.id)}
              onChange={() => toggleRecordSelection(record.id)}
            />
          </td>
          <td>{record.fields.Name}</td>
          <td>{record.fields.Color}</td>
          <td>{record.fields.Brand}</td>
          <td>{record.fields.Model}</td>
          <td>{record.fields.Year}</td>
          <td>{record.fields.Price}</td>
          <td>{new Date(record.createdTime).toLocaleString()}</td>
          <td className="icon-cell">
            <FontAwesomeIcon icon={faEye} onClick={() => openModal(record)} />
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>


      {selectedRecord && (
        <ReactModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Record Details"
          className="Modal"
          overlayClassName="Overlay"
        >
          <button className="close-btn" onClick={closeModal}>
            &times;
          </button>
          <h2>
            {selectedRecord.id
              ? `Details for ${selectedRecord.fields.Name}`
              : "Create New Car"}
          </h2>

          <label>
            Name:
            <input
              type="text"
              value={newRecord.Name}
              onChange={(e) =>
                setNewRecord({ ...newRecord, Name: e.target.value })
              }
              className={validationErrors.Name ? "input-error" : ""} // Apply error class conditionally
            />
            {validationErrors.Name && (
              <span className="input-field-error-message">
                {validationErrors.Name}
              </span>
            )}
          </label>

          <label>
            Color:
            <input
              type="text"
              value={newRecord.Color}
              onChange={(e) =>
                setNewRecord({ ...newRecord, Color: e.target.value })
              }
              className={validationErrors.Color ? "input-error" : ""}
            />
            {validationErrors.Color && (
              <span className="input-field-error-message">
                {validationErrors.Color}
              </span>
            )}
          </label>

          <label>
            Brand:
            <input
              type="text"
              value={newRecord.Brand}
              onChange={(e) =>
                setNewRecord({ ...newRecord, Brand: e.target.value })
              }
              className={validationErrors.Brand ? "input-error" : ""}
            />
            {validationErrors.Brand && (
              <span className="input-field-error-message">
                {validationErrors.Brand}
              </span>
            )}
          </label>

          <label>
            Model:
            <input
              type="text"
              value={newRecord.Model}
              onChange={(e) =>
                setNewRecord({ ...newRecord, Model: e.target.value })
              }
              className={validationErrors.Model ? "input-error" : ""}
            />
            {validationErrors.Model && (
              <span className="input-field-error-message">
                {validationErrors.Model}
              </span>
            )}
          </label>

          <label>
            Year:
            <input
              type="text"
              value={newRecord.Year}
              onChange={(e) =>
                setNewRecord({ ...newRecord, Year: e.target.value })
              }
              className={validationErrors.Year ? "input-error" : ""}
            />
            {validationErrors.Year && (
              <span className="input-field-error-message">
                {validationErrors.Year}
              </span>
            )}
          </label>

          <label>
            Price:
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "5px" }}>€</span>
              <input
                type="text"
                value={newRecord.Price}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, Price: e.target.value })
                }
                className={validationErrors.Price ? "input-error" : ""}
                style={{ flex: 1 }} // Ensures the input takes the available space next to the symbol
              />
            </div>
            {validationErrors.Price && (
              <span className="input-field-error-message">
                {validationErrors.Price}
              </span>
            )}
          </label>

          {selectedRecord && selectedRecord.id ? (
            <button onClick={handleUpdateRecord}>Save</button> // Show Save button for editing
          ) : (
            <button onClick={handleCreateRecord}>Create</button> // Show Create button for new record
          )}
        </ReactModal>
      )}
    </div>
  );
}

export default Home;

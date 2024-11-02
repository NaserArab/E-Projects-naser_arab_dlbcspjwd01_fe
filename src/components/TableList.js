import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import './TableList.css';
// This component renders a sortable and filterable table to display a list of car records, with options to view and select individual entries.
function TableList(props) {
     const {
          sortField,
          handleSort,
          sortOrder,
          sortedData,
          selectedRecords,
          openModal,
          toggleRecordSelection,
     } = props;
     return (
          <table className="data-table">
               <thead>
                    <tr>
                         <th></th> {/* Checkbox column */}
                         <th onClick={() => handleSort("Name")}>
                              Name{" "}
                              {sortField === "Name"
                                   ? sortOrder === "asc"
                                        ? "▲"
                                        : "▼"
                                   : ""}
                         </th>
                         <th onClick={() => handleSort("Color")}>
                              Color{" "}
                              {sortField === "Color"
                                   ? sortOrder === "asc"
                                        ? "▲"
                                        : "▼"
                                   : ""}
                         </th>
                         <th onClick={() => handleSort("Brand")}>
                              Brand{" "}
                              {sortField === "Brand"
                                   ? sortOrder === "asc"
                                        ? "▲"
                                        : "▼"
                                   : ""}
                         </th>
                         <th onClick={() => handleSort("Model")}>
                              Model{" "}
                              {sortField === "Model"
                                   ? sortOrder === "asc"
                                        ? "▲"
                                        : "▼"
                                   : ""}
                         </th>
                         <th onClick={() => handleSort("Year")}>
                              Year{" "}
                              {sortField === "Year"
                                   ? sortOrder === "asc"
                                        ? "▲"
                                        : "▼"
                                   : ""}
                         </th>
                         <th onClick={() => handleSort("Price")}>
                              Price{" "}
                              {sortField === "Price"
                                   ? sortOrder === "asc"
                                        ? "▲"
                                        : "▼"
                                   : ""}
                         </th>
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
                              <tr
                                   key={record.id}
                                   onDoubleClick={() => openModal(record)}
                                   style={{ cursor: "pointer" }}
                              >
                                   <td className="checkbox-cell">
                                        <input
                                             type="checkbox"
                                             checked={selectedRecords.includes(
                                                  record.id
                                             )}
                                             onChange={() =>
                                                  toggleRecordSelection(
                                                       record.id
                                                  )
                                             }
                                        />
                                   </td>
                                   <td>{record.fields.Name}</td>
                                   <td>{record.fields.Color}</td>
                                   <td>{record.fields.Brand}</td>
                                   <td>{record.fields.Model}</td>
                                   <td>{record.fields.Year}</td>
                                   <td>{record.fields.Price}</td>
                                   <td>
                                        {new Date(
                                             record.createdTime
                                        ).toLocaleString()}
                                   </td>
                                   <td className="icon-cell">
                                        <FontAwesomeIcon
                                             icon={faEye}
                                             onClick={() => openModal(record)}
                                        />
                                   </td>
                              </tr>
                         ))
                    )}
               </tbody>
          </table>
     );
}

export default TableList;
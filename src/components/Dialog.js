import React from "react";
import ReactModal from "react-modal";

function Dialog(props) {
     const {
          modalIsOpen,
          closeModal,
          selectedRecord,
          newRecord,
          setNewRecord,
          validationErrors,
          handleUpdateRecord,
          handleCreateRecord,
     } = props;
     return (
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
                              setNewRecord({
                                   ...newRecord,
                                   Name: e.target.value,
                              })
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
                              setNewRecord({
                                   ...newRecord,
                                   Color: e.target.value,
                              })
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
                              setNewRecord({
                                   ...newRecord,
                                   Brand: e.target.value,
                              })
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
                              setNewRecord({
                                   ...newRecord,
                                   Model: e.target.value,
                              })
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
                              setNewRecord({
                                   ...newRecord,
                                   Year: e.target.value,
                              })
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
                    <div
                         style={{
                              display: "flex",
                              alignItems: "center",
                         }}
                    >
                         <span style={{ marginRight: "5px" }}>€</span>
                         <input
                              type="text"
                              value={newRecord.Price}
                              onChange={(e) =>
                                   setNewRecord({
                                        ...newRecord,
                                        Price: e.target.value,
                                   })
                              }
                              className={
                                   validationErrors.Price ? "input-error" : ""
                              }
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
     );
}

export default Dialog;
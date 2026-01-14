import React, { useState, useMemo } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react';

const SmartDropdown = ({
    options = [], // Array of objects { id, name, ... }
    selectedId,
    onSelect,
    onCreateNew,
    placeholder = "Select an item...",
    searchPlaceholder = "Search...",
    createLabel = "Create New",
    displayKey = "name", // Key to display in the list
    idKey = "id"         // Key to use as ID
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Find selected item for display on the toggle button
    const selectedItem = useMemo(() =>
        options.find(opt => opt[idKey] === selectedId),
        [options, selectedId, idKey]);

    // Filter options based on search term
    const filteredOptions = useMemo(() =>
        options.filter(opt =>
            String(opt[displayKey]).toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [options, searchTerm, displayKey]);

    return (
        <Dropdown className="d-grid">
            <Dropdown.Toggle variant="outline-light" className="text-start d-flex justify-content-between align-items-center bg-white border">
                <span className="text-truncate">
                    {selectedItem ? selectedItem[displayKey] : <span className="text-muted">{placeholder}</span>}
                </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100 p-0 shadow-sm" style={{ minWidth: '100%' }}>
                <div className="p-2 border-bottom">
                    <div className="input-group input-group-sm">
                        <span className="input-group-text border-0 bg-transparent ps-0">
                            <MagnifyingGlass size={16} />
                        </span>
                        <Form.Control
                            autoFocus
                            className="border-0 shadow-none ps-0"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <Dropdown.Item
                                key={opt[idKey]}
                                eventKey={opt[idKey]}
                                active={opt[idKey] === selectedId}
                                onClick={() => onSelect(opt[idKey])}
                            >
                                {opt[displayKey]}
                            </Dropdown.Item>
                        ))
                    ) : (
                        <div className="text-muted p-3 text-center small">No results found</div>
                    )}
                </div>

                {onCreateNew && (
                    <>
                        <Dropdown.Divider className="my-0" />
                        <Dropdown.Item className="text-primary py-2 d-flex align-items-center" onClick={onCreateNew}>
                            <Plus className="me-2" size={16} />
                            {createLabel}
                        </Dropdown.Item>
                    </>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default SmartDropdown;

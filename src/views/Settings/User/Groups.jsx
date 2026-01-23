import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Dropdown, Form, InputGroup, Pagination } from 'react-bootstrap';
import { Plus, Trash, PencilSimple, DotsThreeVertical, Archive, UsersThree, MagnifyingGlass, FilePdf, FileXls } from '@phosphor-icons/react';
import { supabase } from '../../../configs/supabaseClient';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import GroupFormModal from './GroupFormModal';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';

const Groups = () => {
    const [showModal, setShowModal] = useState(false);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentGroup, setCurrentGroup] = useState(null); // For editing

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_groups')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGroups(data || []);
        } catch (error) {
            console.error('Error fetching groups:', error.message);
            toast.error('Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setCurrentGroup(null);
    };

    const handleShowAdd = () => {
        setCurrentGroup(null);
        setShowModal(true);
    };

    const handleShowEdit = (group) => {
        setCurrentGroup(group);
        setShowModal(true);
    };

    const handleSuccess = () => {
        fetchGroups();
    };

    // Filter Logic
    const filteredGroups = groups.filter(group =>
        (group.name && group.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredGroups.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredGroups.length / rowsPerPage);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Export to Excel
    const handleExportExcel = () => {
        const dataToExport = filteredGroups.map(group => ({
            Name: group.name,
            Description: group.description || 'No Description',
            Created_At: dayjs(group.created_at).format('DD-MM-YYYY')
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Groups");
        XLSX.writeFile(wb, "Groups.xlsx");
    };

    // Export to PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Name", "Description", "Created At"];
        const tableRows = [];

        filteredGroups.forEach(group => {
            const rowData = [
                group.name,
                group.description || 'No Description',
                dayjs(group.created_at).format('DD-MM-YYYY')
            ];
            tableRows.push(rowData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Groups Report", 14, 15);
        doc.save("Groups.pdf");
    };

    const handleDeleteGroup = async (id) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;

        try {
            const { error } = await supabase.from('app_groups').delete().eq('id', id);
            if (error) throw error;
            toast.success("Group deleted successfully!");
            fetchGroups();
        } catch (error) {
            console.error('Error deleting group:', error.message);
            toast.error(`Error deleting group: ${error.message}`);
        }
    };

    return (
        <>
            <Card className="card-border">
                <Card.Body className="p-0">
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 me-3">Groups</h5>
                            <InputGroup size="sm" style={{ width: '250px' }}>
                                <InputGroup.Text><MagnifyingGlass /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search groups..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </InputGroup>
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="outline-success" size="sm" onClick={handleExportExcel} title="Export to Excel">
                                <FileXls size={18} /> Excel
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={handleExportPDF} title="Export to PDF">
                                <FilePdf size={18} /> PDF
                            </Button>
                            <Button className="btn-gradient-primary btn-animated" size="sm" onClick={handleShowAdd}>
                                <Plus weight="bold" className="me-2" color="#fff" /> Add Group
                            </Button>
                        </div>
                    </div>
                    <div className="table-advance-container">
                        <Table responsive borderless className="nowrap table-advance">
                            <thead>
                                <tr>
                                    <th className="mnw-150p">Group Name</th>
                                    <th className="mnw-200p">Description</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="text-center">Loading groups...</td>
                                    </tr>
                                ) : groups.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center">No groups found. Create one to get started.</td>
                                    </tr>
                                ) : (
                                    currentRows.map((group, index) => (
                                        <React.Fragment key={group.id}>
                                            <tr>
                                                <td className="text-truncate">
                                                    <div className="media align-items-center">
                                                        <div className="media-head me-3">
                                                            <div className="avatar avatar-xs avatar-soft-primary avatar-rounded">
                                                                <span className="initial-wrap">
                                                                    <UsersThree size={18} weight="bold" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="media-body mnw-0">
                                                            <Button variant="link" className="table-link-text text-high-em text-truncate mb-0 p-0" onClick={() => handleShowEdit(group)}>{group.name}</Button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-truncate">{group.description || <span className="text-muted text-italic">No description</span>}</td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-end">
                                                        <HkTooltip placement="top" title="Archive" trigger="hover">
                                                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => toast.success("Archived (Mock)")}>
                                                                <span className="icon">
                                                                    <Archive size={20} />
                                                                </span>
                                                            </Button>
                                                        </HkTooltip>
                                                        <HkTooltip placement="top" title="Edit" trigger="hover">
                                                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleShowEdit(group)}>
                                                                <span className="icon">
                                                                    <PencilSimple size={20} />
                                                                </span>
                                                            </Button>
                                                        </HkTooltip>
                                                        <Dropdown className="dropdown-inline" align="end">
                                                            <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret">
                                                                <HkTooltip placement="top" title="More" trigger="hover">
                                                                    <span className="icon">
                                                                        <DotsThreeVertical size={20} weight="bold" />
                                                                    </span>
                                                                </HkTooltip>
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu
                                                                popperConfig={{
                                                                    modifiers: [
                                                                        {
                                                                            name: 'flip',
                                                                            options: {
                                                                                fallbackPlacements: ['bottom-end', 'top-end'],
                                                                                boundary: 'viewport',
                                                                            },
                                                                        },
                                                                        {
                                                                            name: 'preventOverflow',
                                                                            options: {
                                                                                boundary: 'viewport',
                                                                            },
                                                                        },
                                                                    ],
                                                                }}
                                                                style={{ zIndex: 1100 }}
                                                            >
                                                                <Dropdown.Item onClick={() => handleShowEdit(group)}>Edit Group</Dropdown.Item>
                                                                <Dropdown.Divider />
                                                                <Dropdown.Item className="text-danger" onClick={() => handleDeleteGroup(group.id)}>Delete Group</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </div>
                                                </td>
                                            </tr>
                                            {index < groups.length - 1 && <tr className="table-row-gap"><td colSpan="3" /></tr>}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-3 d-flex justify-content-end">
                            <Pagination>
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                {[...Array(totalPages)].map((_, i) => (
                                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => handlePageChange(i + 1)}>
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}

                    <GroupFormModal
                        show={showModal}
                        onHide={handleClose}
                        onSuccess={handleSuccess}
                        initialGroup={currentGroup}
                    />
                </Card.Body>
            </Card>
        </>
    );
};

export default Groups;

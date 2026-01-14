import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Dropdown, Modal, Form, Row, Col, Pagination, InputGroup } from 'react-bootstrap';
import { Plus, Trash, PencilSimple, DotsThreeVertical, Archive, UserPlus, UserCirclePlus, MagnifyingGlass, FilePdf, FileXls } from '@phosphor-icons/react';
import { supabase } from '../../../configs/supabaseClient';
import toast from 'react-hot-toast';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import classNames from 'classnames';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';
import GroupFormModal from './GroupFormModal';
import AIFormControl from '../../../components/AIFormControl/AIFormControl';
import useAuditLog, { AuditResourceType } from '../../../hooks/useAuditLog';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groups, setGroups] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // For editing
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        group_id: '',
        access_level: 'Employee',
        status: 'Active'
    });

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_profiles')
                .select(`
                    *,
                    app_groups (name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error.message);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        const { data } = await supabase.from('app_groups').select('id, name');
        setGroups(data || []);
    };

    // Filter Logic
    const filteredUsers = users.filter(user =>
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Export to Excel
    const handleExportExcel = () => {
        const dataToExport = filteredUsers.map(user => ({
            Name: user.full_name,
            Email: user.email,
            Group: user.app_groups?.name || 'No Group',
            Access_Level: user.access_level,
            Status: user.status,
            Created_At: new Date(user.created_at).toLocaleDateString()
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(wb, "Users.xlsx");

        useAuditLog.logExport(
            AuditResourceType.USER,
            'User List',
            'excel'
        );
    };

    // Export to PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Name", "Email", "Group", "Access", "Status"];
        const tableRows = [];

        filteredUsers.forEach(user => {
            const rowData = [
                user.full_name,
                user.email,
                user.app_groups?.name || 'No Group',
                user.access_level,
                user.status
            ];
            tableRows.push(rowData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Users Report", 14, 15);
        doc.save("Users.pdf");

        useAuditLog.logExport(
            AuditResourceType.USER,
            'User List',
            'pdf'
        );
    };

    useEffect(() => {
        fetchUsers();
        fetchGroups();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setCurrentUser(null);
        setFormData({
            full_name: '',
            email: '',
            group_id: '',
            access_level: 'Employee',
            status: 'Active'
        });
    };

    const handleShowAdd = () => {
        setCurrentUser(null);
        setShowModal(true);
    };

    const handleShowEdit = (user) => {
        setCurrentUser(user);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            group_id: user.group_id || '',
            access_level: user.access_level || 'Employee',
            status: user.status || 'Active'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentUser) {
                // Update
                const { error } = await supabase
                    .from('user_profiles')
                    .update(formData)
                    .eq('id', currentUser.id);
                if (error) throw error;
                toast.success('User updated successfully!');

                await useAuditLog.logUpdate(
                    AuditResourceType.USER,
                    currentUser.id,
                    currentUser.full_name || currentUser.email,
                    currentUser, // old values
                    formData // new values
                );
            } else {
                // Create
                const { error } = await supabase
                    .from('user_profiles')
                    .insert([formData]);
                if (error) throw error;
                toast.success('User created successfully!');

                await useAuditLog.logCreate(
                    AuditResourceType.USER,
                    null, // ID might not be returned immediately unless we select it, but it's optional
                    formData.full_name || formData.email,
                    formData
                );
            }
            handleClose();
            fetchUsers();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDisableUser = async (id) => {
        if (!window.confirm("Are you sure you want to disable this user? They will be marked as Inactive.")) return;
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ status: 'Inactive' })
                .eq('id', id);

            if (error) throw error;
            toast.success("User disabled successfully!");

            await useAuditLog.logUpdate(
                AuditResourceType.USER,
                id,
                'User Account',
                { status: 'Active' },
                { status: 'Inactive' }
            );
            fetchUsers();
        } catch (error) {
            toast.error(`Error disabling user: ${error.message}`);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This will only delete the profile, not the Auth user.")) return;
        try {
            const { error } = await supabase.from('user_profiles').delete().eq('id', id);
            if (error) throw error;
            toast.success("User profile deleted successfully!");

            await useAuditLog.logDelete(
                AuditResourceType.USER,
                id,
                'User Profile'
            );
            fetchUsers();
        } catch (error) {
            toast.error(`Error deleting user: ${error.message}`);
        }
    };

    return (
        <>
            <Card className="card-border">
                <Card.Body className="p-0">

                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 me-3">Users</h5>
                            <InputGroup size="sm" style={{ width: '250px' }}>
                                <InputGroup.Text><MagnifyingGlass /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </InputGroup>
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="outline-success" size="sm" onClick={handleExportExcel} title="Export to Excel">
                                <FileXls size={18} weight="bold" /> Excel
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={handleExportPDF} title="Export to PDF">
                                <FilePdf size={18} weight="bold" /> PDF
                            </Button>
                            <Button className="btn-gradient-primary btn-animated" size="sm" onClick={handleShowAdd}>
                                <UserCirclePlus weight="bold" className="me-2" color="#fff" /> Add User
                            </Button>
                        </div>
                    </div>
                    <div className="table-advance-container">
                        <Table responsive borderless className="nowrap table-advance">
                            <thead>
                                <tr>
                                    <th className="mnw-200p">Name</th>
                                    <th className="mnw-150p">Group</th>
                                    <th>Access Level</th>
                                    <th>Status</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">Loading users...</td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">No users found. Create one to get started.</td>
                                    </tr>
                                ) : (
                                    currentRows.map((user, index) => (
                                        <React.Fragment key={user.id}>
                                            <tr>
                                                <td className="text-truncate">
                                                    <div className="media align-items-center">
                                                        <div className="media-head me-3">
                                                            <div className="avatar avatar-xs avatar-soft-primary avatar-rounded">
                                                                <span className="initial-wrap">{user.full_name?.charAt(0) || 'U'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="media-body mnw-0">
                                                            <Button variant="link" className="table-link-text text-high-em text-truncate mb-0 p-0" onClick={() => handleShowEdit(user)}>{user.full_name || user.email}</Button>
                                                            <div className="fs-8 text-muted text-truncate pt-1">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-truncate">
                                                    {user.app_groups?.name || <span className="text-muted">No Group</span>}
                                                </td>
                                                <td>
                                                    <span className={classNames("badge badge-sm badge-outline", {
                                                        "badge-danger": user.access_level === 'Administrator',
                                                        "badge-primary": user.access_level === 'Manager',
                                                        "badge-secondary": user.access_level === 'Employee'
                                                    })}>
                                                        {user.access_level}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={classNames("badge badge-indicator badge-indicator-lg", {
                                                        "badge-success": user.status === 'Active',
                                                        "badge-warning": user.status === 'Inactive',
                                                        "badge-danger": user.status === 'Suspended'
                                                    })} />
                                                    <span className="ms-2">{user.status}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-end">
                                                        <HkTooltip placement="top" title="Disable" trigger="hover">
                                                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleDisableUser(user.id)}>
                                                                <span className="icon">
                                                                    <Archive size={20} weight="bold" />
                                                                </span>
                                                            </Button>
                                                        </HkTooltip>
                                                        <HkTooltip placement="top" title="Edit" trigger="hover">
                                                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleShowEdit(user)}>
                                                                <span className="icon">
                                                                    <PencilSimple size={20} weight="bold" />
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
                                                                <Dropdown.Item onClick={() => handleShowEdit(user)}>Edit User</Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handleDisableUser(user.id)}>Disable User</Dropdown.Item>
                                                                <Dropdown.Divider />
                                                                <Dropdown.Item className="text-danger" onClick={() => handleDeleteUser(user.id)}>Delete User</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </div>
                                                </td>

                                            </tr>
                                            {index < users.length - 1 && <tr className="table-row-gap"><td colSpan="5" /></tr>}
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

                    {/* Modals */}
                    <Modal show={showModal} onHide={handleClose} centered className={classNames({ "modal-faded": showGroupModal })}>
                        <Modal.Header closeButton>
                            <Modal.Title>{currentUser ? 'Edit User' : 'Add New User'}</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleSubmit}>
                            <Modal.Body>
                                <Row className="g-3">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Full Name</Form.Label>
                                            <AIFormControl
                                                type="text"
                                                placeholder="Enter full name"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                required
                                                fieldName="Full Name"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Email Address</Form.Label>
                                            <AIFormControl
                                                type="email"
                                                placeholder="user@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                fieldName="Email Address"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <Form.Label>Assign Group</Form.Label>
                                                <Button variant="link" size="sm" className="p-0" onClick={() => setShowGroupModal(true)}>+ New Group</Button>
                                            </div>
                                            <Form.Select
                                                value={formData.group_id}
                                                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                                            >
                                                <option value="">Select Group</option>
                                                {groups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Access Level</Form.Label>
                                            <Form.Select
                                                value={formData.access_level}
                                                onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
                                            >
                                                <option value="Administrator">Administrator</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Employee">Employee</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Status</Form.Label>
                                            <Form.Select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Suspended">Suspended</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                                <Button className="btn-gradient-primary" type="submit">
                                    {currentUser ? 'Save Changes' : 'Create User'}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    <GroupFormModal
                        show={showGroupModal}
                        onHide={() => setShowGroupModal(false)}
                        onSuccess={() => {
                            fetchGroups();
                            setShowGroupModal(false);
                        }}
                    />
                </Card.Body>
            </Card>
        </>
    );
};

export default UsersList;

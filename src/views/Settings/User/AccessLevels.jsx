import React, { useState } from 'react';
import { Button, Card, InputGroup, Form, Dropdown, Modal, Row, Col } from 'react-bootstrap';
import { PencilSimple, DotsThreeVertical, Archive, ShieldCheck, Shield, ShieldStar, MagnifyingGlass, FilePdf, FileXls, Plus, Users } from '@phosphor-icons/react';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ResponsiveDataView from '../../../components/ResponsiveDataView';

const accessLevels = [
    {
        id: 1,
        name: 'Administrator',
        description: 'Full system access, including billing and security settings.',
        usersCount: 2,
        type: 'System',
        icon: <ShieldStar size={18} weight="bold" />,
        variant: 'soft-danger',
        color: '#ef4444',
        bgColor: '#fef2f2'
    },
    {
        id: 2,
        name: 'Manager',
        description: 'Can manage users, groups, and content but cannot change security settings.',
        usersCount: 5,
        type: 'System',
        icon: <ShieldCheck size={18} weight="bold" />,
        variant: 'soft-primary',
        color: '#3b82f6',
        bgColor: '#eff6ff'
    },
    {
        id: 3,
        name: 'Employee',
        description: 'Standard access to workspace content and personal settings.',
        usersCount: 24,
        type: 'Custom',
        icon: <Shield size={18} weight="bold" />,
        variant: 'soft-success',
        color: '#10b981',
        bgColor: '#ecfdf5'
    }
];

const AccessLevels = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [levels, setLevels] = useState(accessLevels);

    // Filter Logic
    const filteredLevels = levels.filter(level =>
        level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        level.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Export to Excel
    const handleExportExcel = () => {
        const dataToExport = filteredLevels.map(level => ({
            Name: level.name,
            Description: level.description,
            Users: level.usersCount,
            Type: level.type
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "AccessLevels");
        XLSX.writeFile(wb, "AccessLevels.xlsx");
    };

    // Export to PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Name", "Description", "Users", "Type"];
        const tableRows = [];

        filteredLevels.forEach(level => {
            const rowData = [
                level.name,
                level.description,
                level.usersCount,
                level.type
            ];
            tableRows.push(rowData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Access Levels Report", 14, 15);
        doc.save("AccessLevels.pdf");
    };

    // Column configuration for table view
    const columns = [
        {
            key: 'name',
            label: 'Level Name',
            className: 'mnw-200p',
            render: (value, item) => (
                <div className="media align-items-center">
                    <div className="media-head me-3">
                        <div className={`avatar avatar-xs avatar-${item.variant} avatar-rounded`}>
                            <span className="initial-wrap">{item.icon}</span>
                        </div>
                    </div>
                    <div className="media-body mnw-0">
                        <div className="table-link-text text-high-em text-truncate mb-0">{value}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'description',
            label: 'Description',
            className: 'mnw-250p',
            render: (value) => (
                <span style={{ maxWidth: '250px', whiteSpace: 'normal', display: 'block' }}>
                    {value}
                </span>
            )
        },
        {
            key: 'usersCount',
            label: 'Users',
            render: (value) => (
                <span className="badge badge-lg badge-light">{value} Users</span>
            )
        },
        {
            key: 'type',
            label: 'Type',
            render: (value) => (
                value === 'System'
                    ? <span className="badge badge-outline badge-danger">System</span>
                    : <span className="badge badge-outline badge-secondary">Custom</span>
            )
        },
        {
            key: 'actions',
            label: '',
            render: (_, item) => (
                <div className="d-flex align-items-center justify-content-end">
                    <HkTooltip placement="top" title="Archive" trigger="hover">
                        <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => toast.success("Archived (Mock)")}>
                            <span className="icon"><Archive size={20} /></span>
                        </Button>
                    </HkTooltip>
                    <HkTooltip placement="top" title="Edit" trigger="hover">
                        <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => toast.success("Edit (Mock)")}>
                            <span className="icon"><PencilSimple size={20} /></span>
                        </Button>
                    </HkTooltip>
                    <Dropdown className="dropdown-inline" align="end">
                        <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret">
                            <HkTooltip placement="top" title="More" trigger="hover">
                                <span className="icon"><DotsThreeVertical size={20} weight="bold" /></span>
                            </HkTooltip>
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ zIndex: 1100 }}>
                            <Dropdown.Item onClick={() => toast.success("Edit (Mock)")}>Edit Level</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item className="text-danger" onClick={() => toast.error("Cannot delete system levels")}>Delete Level</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            )
        }
    ];

    // Card renderer for mobile Bento layout
    const renderCard = (item) => (
        <div style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            borderRadius: '1rem',
            border: '1px solid var(--color-border-subtle, #f1f5f9)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
            padding: '1.25rem',
            transition: 'all 0.25s ease'
        }}>
            {/* Header with Icon and Name */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '2.75rem',
                        height: '2.75rem',
                        borderRadius: '0.75rem',
                        backgroundColor: item.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color
                    }}>
                        {React.cloneElement(item.icon, { size: 22 })}
                    </div>
                    <div>
                        <h4 style={{
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: 'var(--color-text-primary, #0f172a)',
                            margin: 0,
                            marginBottom: '0.25rem'
                        }}>
                            {item.name}
                        </h4>
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: `1px solid ${item.type === 'System' ? '#fecaca' : '#e2e8f0'}`,
                            color: item.type === 'System' ? '#dc2626' : '#64748b',
                            fontWeight: 500
                        }}>
                            {item.type}
                        </span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary, #64748b)',
                lineHeight: 1.5,
                marginBottom: '1rem'
            }}>
                {item.description}
            </p>

            {/* Users Count */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
            }}>
                <Users size={18} color="#64748b" />
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    <strong style={{ color: '#0f172a' }}>{item.usersCount}</strong> users assigned
                </span>
            </div>

            {/* Actions */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border, #e2e8f0)'
            }}>
                <Button
                    variant="outline-primary"
                    size="sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={() => toast.success("Edit (Mock)")}
                >
                    <PencilSimple size={16} /> Edit
                </Button>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={() => toast.success("Archived (Mock)")}
                >
                    <Archive size={16} />
                </Button>
            </div>
        </div>
    );

    // Table row renderer for desktop
    const renderTableRow = (item, index) => (
        <React.Fragment key={item.id}>
            <tr>
                <td className="text-truncate">
                    <div className="media align-items-center">
                        <div className="media-head me-3">
                            <div className={`avatar avatar-xs avatar-${item.variant} avatar-rounded`}>
                                <span className="initial-wrap">{item.icon}</span>
                            </div>
                        </div>
                        <div className="media-body mnw-0">
                            <div className="table-link-text text-high-em text-truncate mb-0">{item.name}</div>
                        </div>
                    </div>
                </td>
                <td className="text-truncate" style={{ maxWidth: '250px', whiteSpace: 'normal' }}>
                    {item.description}
                </td>
                <td>
                    <span className="badge badge-lg badge-light">{item.usersCount} Users</span>
                </td>
                <td>
                    {item.type === 'System' ? (
                        <span className="badge badge-outline badge-danger">System</span>
                    ) : (
                        <span className="badge badge-outline badge-secondary">Custom</span>
                    )}
                </td>
                <td>
                    <div className="d-flex align-items-center justify-content-end">
                        <HkTooltip placement="top" title="Archive" trigger="hover">
                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => toast.success("Archived (Mock)")}>
                                <span className="icon"><Archive size={20} /></span>
                            </Button>
                        </HkTooltip>
                        <HkTooltip placement="top" title="Edit" trigger="hover">
                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => toast.success("Edit (Mock)")}>
                                <span className="icon"><PencilSimple size={20} /></span>
                            </Button>
                        </HkTooltip>
                        <Dropdown className="dropdown-inline" align="end">
                            <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret">
                                <HkTooltip placement="top" title="More" trigger="hover">
                                    <span className="icon"><DotsThreeVertical size={20} weight="bold" /></span>
                                </HkTooltip>
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ zIndex: 1100 }}>
                                <Dropdown.Item onClick={() => toast.success("Edit (Mock)")}>Edit Level</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item className="text-danger" onClick={() => toast.error("Cannot delete system levels")}>Delete Level</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </td>
            </tr>
            {index < levels.length - 1 && <tr className="table-row-gap"><td colSpan="5" /></tr>}
        </React.Fragment>
    );

    return (
        <>
            <Card className="card-border">
                <Card.Body className="p-0">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <h5 className="mb-0 me-3">Access Levels</h5>
                            <InputGroup size="sm" style={{ width: '250px', minWidth: '180px' }}>
                                <InputGroup.Text><MagnifyingGlass /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search levels..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </InputGroup>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                            <Button variant="outline-success" size="sm" onClick={handleExportExcel} title="Export to Excel">
                                <FileXls size={18} /> <span className="d-none d-sm-inline">Excel</span>
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={handleExportPDF} title="Export to PDF">
                                <FilePdf size={18} /> <span className="d-none d-sm-inline">PDF</span>
                            </Button>
                            <Button className="btn-gradient-primary btn-animated" size="sm" onClick={() => toast.success("Feature coming soon!")}>
                                <Plus weight="bold" className="me-1" /> <span className="d-none d-sm-inline">Add Level</span>
                            </Button>
                        </div>
                    </div>

                    {/* Responsive Data View */}
                    <div className="p-3 pt-0">
                        <ResponsiveDataView
                            data={filteredLevels}
                            columns={columns}
                            renderCard={renderCard}
                            renderTableRow={renderTableRow}
                            keyField="id"
                            itemsPerPage={10}
                            emptyState={{
                                icon: <Shield size={48} weight="light" />,
                                title: 'No access levels found',
                                description: 'Create access levels to manage user permissions'
                            }}
                            allowViewToggle={true}
                        />
                    </div>
                </Card.Body>
            </Card>
        </>
    );
};

export default AccessLevels;

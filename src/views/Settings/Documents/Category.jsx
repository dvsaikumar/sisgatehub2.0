import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Plus, Folder, Trash, PencilSimple, MagnifyingGlass, FilePdf, FileXls, FolderOpen } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { supabase } from '../../../configs/supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ResponsiveDataView from '../../../components/ResponsiveDataView';

const Category = () => {
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', parent: '' });
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_document_categories')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Export to Excel
    const handleExportExcel = () => {
        const dataToExport = filteredCategories.map(cat => ({
            Name: cat.name,
            Type: cat.parent_id ? 'Sub-Category' : 'Main Category',
            Parent: cat.parent_id ? categories.find(c => c.id === cat.parent_id)?.name : '-'
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Categories");
        XLSX.writeFile(wb, "Categories.xlsx");
    };

    // Export to PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Name", "Type", "Parent Category"];
        const tableRows = [];

        filteredCategories.forEach(cat => {
            const catData = [
                cat.name,
                cat.parent_id ? 'Sub-Category' : 'Main Category',
                cat.parent_id ? categories.find(c => c.id === cat.parent_id)?.name : '-'
            ];
            tableRows.push(catData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Categories Report", 14, 15);
        doc.save("Categories.pdf");
    };

    const handleClose = () => {
        setShowModal(false);
        setFormData({ name: '', parent: '' });
        setEditingId(null);
    };

    const handleShow = (category = null) => {
        if (category) {
            setEditingId(category.id);
            setFormData({
                name: category.name,
                parent: category.parent_id || ''
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', parent: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const categoryData = {
                name: formData.name,
                icon: 'Folder',
                parent_id: formData.parent ? formData.parent : null
            };

            if (editingId) {
                const { error } = await supabase
                    .from('app_document_categories')
                    .update(categoryData)
                    .eq('id', editingId);

                if (error) throw error;
                toast.success("Category updated successfully!");
            } else {
                const { error } = await supabase
                    .from('app_document_categories')
                    .insert([categoryData]);

                if (error) throw error;
                toast.success("Category added successfully!");
            }

            fetchCategories();
            handleClose();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will delete the category and potential sub-categories.")) {
            try {
                const { error } = await supabase
                    .from('app_document_categories')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setCategories(categories.filter(c => c.id !== id));
                toast.success("Category deleted");
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category');
            }
        }
    };

    // Column configuration for ResponsiveDataView
    const columns = [
        {
            key: 'name',
            label: 'Name',
            className: 'mnw-200p',
            render: (value, item) => (
                <div className="d-flex align-items-center">
                    <div className="avatar avatar-xs avatar-soft-primary avatar-rounded me-3">
                        <span className="initial-wrap">
                            <Folder size={18} weight={item.parent_id ? "regular" : "fill"} />
                        </span>
                    </div>
                    <span className="text-high-em">{value}</span>
                </div>
            )
        },
        {
            key: 'type',
            label: 'Type',
            render: (_, item) => (
                <span className={`badge badge-sm badge-outline badge-${item.parent_id ? 'secondary' : 'primary'}`}>
                    {item.parent_id ? 'Sub-Category' : 'Main Category'}
                </span>
            )
        },
        {
            key: 'parent',
            label: 'Parent Category',
            render: (_, item) => item.parent_id
                ? categories.find(c => c.id === item.parent_id)?.name || '-'
                : '-'
        },
        {
            key: 'actions',
            label: '',
            render: (_, item) => (
                <div className="d-flex justify-content-end gap-2">
                    <Button
                        variant="flush-light"
                        className="btn-icon btn-rounded flush-soft-hover"
                        onClick={(e) => { e.stopPropagation(); handleShow(item); }}
                    >
                        <span className="icon"><PencilSimple size={20} /></span>
                    </Button>
                    <Button
                        variant="flush-dark"
                        className="btn-icon btn-rounded flush-soft-hover"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    >
                        <span className="icon"><Trash size={20} /></span>
                    </Button>
                </div>
            )
        }
    ];

    // Card renderer for mobile Bento layout
    const renderCard = (item) => {
        const parentName = item.parent_id
            ? categories.find(c => c.id === item.parent_id)?.name
            : null;

        return (
            <div style={{
                backgroundColor: 'var(--color-surface, #ffffff)',
                borderRadius: '1rem',
                border: '1px solid var(--color-border-subtle, #f1f5f9)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
                padding: '1.25rem',
                transition: 'all 0.25s ease'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '0.75rem',
                            backgroundColor: item.parent_id ? '#f1f5f9' : '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Folder
                                size={20}
                                weight={item.parent_id ? "regular" : "fill"}
                                color={item.parent_id ? '#64748b' : '#3b82f6'}
                            />
                        </div>
                        <div>
                            <h4 style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: 'var(--color-text-primary, #0f172a)',
                                margin: 0
                            }}>
                                {item.name}
                            </h4>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '0.25rem',
                                backgroundColor: item.parent_id ? '#f1f5f9' : '#dbeafe',
                                color: item.parent_id ? '#64748b' : '#3b82f6',
                                fontWeight: 500
                            }}>
                                {item.parent_id ? 'Sub-Category' : 'Main Category'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Parent Info */}
                {parentName && (
                    <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary, #64748b)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <FolderOpen size={16} />
                        <span>Parent: <strong>{parentName}</strong></span>
                    </div>
                )}

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--color-border, #e2e8f0)'
                }}>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={(e) => { e.stopPropagation(); handleShow(item); }}
                    >
                        <PencilSimple size={16} /> Edit
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    >
                        <Trash size={16} />
                    </Button>
                </div>
            </div>
        );
    };

    // Table row renderer for desktop
    const renderTableRow = (item, index) => (
        <tr key={item.id}>
            <td>
                <div className="d-flex align-items-center">
                    <div className="avatar avatar-xs avatar-soft-primary avatar-rounded me-3">
                        <span className="initial-wrap">
                            <Folder size={18} weight={item.parent_id ? "regular" : "fill"} />
                        </span>
                    </div>
                    <span className="text-high-em">{item.name}</span>
                </div>
            </td>
            <td>
                <span className={`badge badge-sm badge-outline badge-${item.parent_id ? 'secondary' : 'primary'}`}>
                    {item.parent_id ? 'Sub-Category' : 'Main Category'}
                </span>
            </td>
            <td>
                {item.parent_id ? categories.find(c => c.id === item.parent_id)?.name : '-'}
            </td>
            <td>
                <div className="d-flex justify-content-end gap-2">
                    <Button variant="flush-light" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleShow(item)}>
                        <span className="icon"><PencilSimple size={20} /></span>
                    </Button>
                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleDelete(item.id)}>
                        <span className="icon"><Trash size={20} /></span>
                    </Button>
                </div>
            </td>
        </tr>
    );

    return (
        <>
            <Card className="card-border">
                <Card.Body className="p-0">
                    {/* Header with Search and Actions */}
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <h5 className="mb-0 me-3">Categories</h5>
                            <InputGroup size="sm" style={{ width: '250px', minWidth: '200px' }}>
                                <InputGroup.Text><MagnifyingGlass /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search categories..."
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
                            <Button className="btn-gradient-primary btn-animated" size="sm" onClick={() => handleShow(null)}>
                                <Plus weight="bold" className="me-1" color="#fff" /> <span className="d-none d-sm-inline">Add Category</span>
                            </Button>
                        </div>
                    </div>

                    {/* Responsive Data View - Cards on Mobile, Table on Desktop */}
                    <div className="p-3 pt-0">
                        <ResponsiveDataView
                            data={filteredCategories}
                            columns={columns}
                            renderCard={renderCard}
                            renderTableRow={renderTableRow}
                            keyField="id"
                            loading={loading}
                            itemsPerPage={10}
                            emptyState={{
                                icon: <Folder size={48} weight="light" />,
                                title: 'No categories found',
                                description: 'Create your first category to organize documents'
                            }}
                            allowViewToggle={true}
                        />
                    </div>

                    {/* Modal for Add/Edit */}
                    <Modal show={showModal} onHide={handleClose} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{editingId ? 'Edit Category' : 'Add Category'}</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleSubmit}>
                            <Modal.Body>
                                <Row className="g-3">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Category Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Parent Category (Optional)</Form.Label>
                                            <Form.Select
                                                value={formData.parent}
                                                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                            >
                                                <option value="">None (Main Category)</option>
                                                {categories.filter(c => !c.parent_id && c.id !== editingId).map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </Form.Select>
                                            <Form.Text className="text-muted">
                                                Select a parent to create a sub-category. Leave empty for main category.
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                                <Button className="btn-gradient-primary" type="submit">
                                    {editingId ? 'Update Category' : 'Add Category'}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                </Card.Body>
            </Card>
        </>
    );
};

export default Category;

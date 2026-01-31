import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col, InputGroup, Pagination } from 'react-bootstrap';
import { Plus, Folder, Trash, PencilSimple, MagnifyingGlass, FilePdf, FileXls } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { supabase } from '../../../configs/supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Category = () => {
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', parent: '' });
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

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
            // Ignore AbortError - happens during normal navigation
            if (error?.name === 'AbortError' || error?.message?.includes('abort')) return;
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
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Pagination Logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredCategories.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);

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

    return (
        <>
            <div>
                {/* Header with Search and Actions */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
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
                    <div className="d-flex gap-2 flex-wrap align-items-center">
                        <Button
                            variant="outline-success"
                            size="sm"
                            onClick={handleExportExcel}
                            title="Export to Excel"
                            className="d-flex align-items-center gap-1"
                        >
                            <FileXls size={16} weight="bold" />
                            <span className="d-none d-sm-inline">Excel</span>
                        </Button>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleExportPDF}
                            title="Export to PDF"
                            className="d-flex align-items-center gap-1"
                        >
                            <FilePdf size={16} weight="bold" />
                            <span className="d-none d-sm-inline">PDF</span>
                        </Button>
                        <Button
                            className="btn-gradient-primary btn-animated d-flex align-items-center gap-2"
                            size="sm"
                            onClick={() => handleShow(null)}
                        >
                            <Plus size={16} weight="bold" color="#fff" />
                            <span className="d-none d-sm-inline">Add Category</span>
                        </Button>
                    </div>
                </div>

                <div className="table-advance-container">
                    <Table borderless className="nowrap table-advance">
                        <thead>
                            <tr>
                                <th className="mnw-200p">Name</th>
                                <th>Type</th>
                                <th>Parent Category</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-4">Loading categories...</td>
                                </tr>
                            ) : currentRows.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-4">No categories found.</td>
                                </tr>
                            ) : (
                                currentRows.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="avatar avatar-xs avatar-soft-primary avatar-rounded me-3">
                                                    <span className="initial-wrap">
                                                        <Folder size={18} weight={cat.parent_id ? "regular" : "fill"} />
                                                    </span>
                                                </div>
                                                <span className="text-high-em">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-sm badge-outline badge-${cat.parent_id ? 'secondary' : 'primary'}`}>
                                                {cat.parent_id ? 'Sub-Category' : 'Main Category'}
                                            </span>
                                        </td>
                                        <td>
                                            {cat.parent_id ? categories.find(c => c.id === cat.parent_id)?.name : '-'}
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button variant="flush-light" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleShow(cat)}>
                                                    <span className="icon"><PencilSimple size={20} /></span>
                                                </Button>
                                                <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleDelete(cat.id)}>
                                                    <span className="icon"><Trash size={20} /></span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
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

            </div>
        </>
    );
};

export default Category;

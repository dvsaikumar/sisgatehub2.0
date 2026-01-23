import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Row, Col, Pagination, InputGroup } from 'react-bootstrap';
import { Plus, FileText, Trash, UploadSimple, PencilSimple, Eye, MagnifyingGlass, FilePdf, FileXls, DownloadSimple, Paperclip, ArrowSquareOut } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { supabase } from '../../../configs/supabaseClient';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import AIFormControl from '../../../components/AIFormControl/AIFormControl';
import AITextEnhancer from '../../../components/AIEnhancer/AITextEnhancer';

const DocumentList = () => {
    const [showModal, setShowModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewDocName, setPreviewDocName] = useState('');

    const [documents, setDocuments] = useState([]);
    const [allCategories, setAllCategories] = useState([]); // Store all raw categories
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]); // Sub-categories of the *selected* main category
    const [selectedMainId, setSelectedMainId] = useState(''); // Track selected main category for UI logic

    // Edit state
    const [editingId, setEditingId] = useState(null);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Guides',
        category_id: '',
        content: '',
        file: null,
        file_path: '' // Keep track of existing file path for edits
    });

    const docTypes = ['Guides', 'Templates', 'Letters', 'Step by Step', 'Checklist', 'Videos', 'Others'];

    const getTypeVariant = (type) => {
        switch (type) {
            case 'Guides': return 'badge-soft-primary';
            case 'Templates': return 'badge-soft-success';
            case 'Letters': return 'badge-soft-info';
            case 'Step by Step': return 'badge-soft-warning';
            case 'Checklist': return 'badge-soft-danger';
            case 'Videos': return 'badge-soft-indigo';
            default: return 'badge-soft-secondary';
        }
    };

    useEffect(() => {
        fetchDocuments();
        fetchCategories();
    }, []);

    // When main category selection changes, update sub-options and reset final category_id
    const handleMainCategoryChange = (e) => {
        const mainId = e.target.value;
        setSelectedMainId(mainId);

        if (mainId) {
            // Filter sub-categories for this parent
            const relatedSubs = allCategories.filter(c => c.parent_id === mainId);
            setSubCategories(relatedSubs);

            // Set the category_id to the main one initially. 
            // If user selects a sub later, we'll update it.
            setFormData({ ...formData, category_id: mainId });
        } else {
            setSubCategories([]);
            setFormData({ ...formData, category_id: '' });
        }
    };

    // When sub category selection changes
    const handleSubCategoryChange = (e) => {
        const subId = e.target.value;
        // If sub selected, use it. If cleared (value=""), fallback to selectedMainId
        setFormData({ ...formData, category_id: subId || selectedMainId });
    };

    // Filter Logic
    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredDocuments.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredDocuments.length / rowsPerPage);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Export to Excel
    const handleExportExcel = () => {
        const dataToExport = filteredDocuments.map(doc => ({
            Name: doc.name,
            Type: doc.type,
            Category: getCategoryDisplayName(doc),
            Content: doc.content ? doc.content.replace(/<[^>]+>/g, '') : '', // Strip HTML
            Created_At: dayjs(doc.created_at).format('DD-MM-YYYY')
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Documents");
        XLSX.writeFile(wb, "Documents.xlsx");
    };

    // Export to PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Name", "Type", "Category", "Created At"];
        const tableRows = [];

        filteredDocuments.forEach(d => {
            const rowData = [
                d.name,
                d.type,
                getCategoryDisplayName(d),
                dayjs(d.created_at).format('DD-MM-YYYY')
            ];
            tableRows.push(rowData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Documents Report", 14, 15);
        doc.save("Documents.pdf");
    };

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_documents')
                .select(`
                    *,
                    app_document_categories (
                        id,
                        name,
                        parent_id
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('app_document_categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            setAllCategories(data || []);
            // Filter out only main categories (no parent)
            setMainCategories(data.filter(c => !c.parent_id) || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setFormData({ name: '', type: 'Guides', category_id: '', content: '', file: null, file_path: '' });
        setSelectedMainId('');
        setSubCategories([]);
        setEditingId(null);
        setUploading(false);
    };

    const handleShow = (doc = null) => {
        if (doc) {
            setEditingId(doc.id);

            // Determine category logic
            let mainId = '';
            let subId = '';

            // Check if existing category is a sub or main
            // To do this properly we need to look up the category in allCategories
            // For now, let's assume if it has a parent_id (in app_document_categories object), it's a sub.
            // But wait, the doc.category_id is just an ID. We have the join data in doc.app_document_categories.

            if (doc.app_document_categories) {
                const cat = doc.app_document_categories;
                if (cat.parent_id) {
                    mainId = cat.parent_id;
                    subId = cat.id;
                } else {
                    mainId = cat.id;
                }
            }

            // Populate categories logic
            setSelectedMainId(mainId);
            if (mainId) {
                const relatedSubs = allCategories.filter(c => c.parent_id === mainId);
                setSubCategories(relatedSubs);
            }

            setFormData({
                name: doc.name,
                type: doc.type,
                category_id: subId || mainId,
                content: doc.content || '',
                file: null, // New file upload resets this
                file_path: doc.file_path // Keep existing public URL reference
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', type: 'Guides', category_id: '', content: '', file: null, file_path: '' });
            setSelectedMainId('');
            setSubCategories([]);
        }
        setShowModal(true);
    };

    const handlePreview = (url, name) => {
        setPreviewUrl(url);
        setPreviewDocName(name);
        setShowPreviewModal(true);
    };

    const uploadFile = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            let uploadedFileUrl = formData.file_path; // Default to existing

            if (formData.file) {
                uploadedFileUrl = await uploadFile(formData.file);
            }

            const docData = {
                name: formData.name,
                type: formData.type,
                category_id: formData.category_id || null,
                content: formData.content,
                file_path: uploadedFileUrl
            };

            if (editingId) {
                // UPDATE
                const { error } = await supabase
                    .from('app_documents')
                    .update(docData)
                    .eq('id', editingId);

                if (error) throw error;
                toast.success("Document updated successfully!");
            } else {
                // INSERT
                const { error } = await supabase
                    .from('app_documents')
                    .insert([docData]);

                if (error) throw error;
                toast.success("Document added successfully!");
            }

            fetchDocuments();
            handleClose();
        } catch (error) {
            console.error('Error saving document:', error);
            // detailed error message if bucket doesn't exist
            if (error.message && error.message.includes('bucket')) {
                toast.error('Storage bucket "documents" not found. Please create it.');
            } else {
                toast.error('Failed to save document');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete document?")) {
            try {
                const { error } = await supabase
                    .from('app_documents')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setDocuments(documents.filter(d => d.id !== id));
                toast.success("Document deleted");
            } catch (error) {
                console.error('Error deleting document:', error);
                toast.error('Failed to delete document');
            }
        }
    };

    // Helper to get full category path name (e.g. "Main > Sub" or just "Main")
    const getCategoryDisplayName = (doc) => {
        if (!doc.app_document_categories) return '-';

        const cat = doc.app_document_categories;
        // If the category has a parent_id, try to find the parent name from allCategories (if available) or just show name
        if (cat.parent_id) {
            const parent = allCategories.find(c => c.id === cat.parent_id);
            return parent ? `${parent.name} > ${cat.name}` : cat.name;
        }
        return cat.name;
    };

    // Helper to strip HTML and decode entities for clean text display
    const getCleanTextContent = (htmlContent) => {
        if (!htmlContent) return '-';

        // Create a temporary element to decode HTML entities
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Get text content (this automatically decodes entities and strips tags)
        return tempDiv.textContent || tempDiv.innerText || '-';
    };

    if (loading) {
        return <div className="p-4 text-center">Loading documents...</div>;
    }

    return (
        <>
            <Card className="card-border">
                <Card.Body className="p-0">
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 me-3">Documents</h5>
                            <InputGroup size="sm" style={{ width: '250px' }}>
                                <InputGroup.Text><MagnifyingGlass /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search documents..."
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
                            <Button className="btn-gradient-primary btn-animated" size="sm" onClick={() => handleShow(null)}>
                                <Plus weight="bold" className="me-2" color="#fff" /> Add Document
                            </Button>
                        </div>
                    </div>

                    <div className="table-advance-container">
                        <Table borderless className="nowrap table-advance">
                            <thead>
                                <tr>
                                    <th className="mnw-200p">Name</th>
                                    <th>Type</th>
                                    <th>Category</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {currentRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center">No documents found.</td>
                                    </tr>
                                ) : (
                                    currentRows.map((doc) => (
                                        <tr key={doc.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar avatar-xs avatar-soft-primary avatar-rounded me-3">
                                                        <span className="initial-wrap">
                                                            <FileText size={18} weight={doc.file_path ? "fill" : "regular"} />
                                                        </span>
                                                    </div>
                                                    <span className="text-high-em">{doc.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-sm badge-outline badge-${doc.type === 'Guides' ? 'primary' : doc.type === 'Templates' ? 'success' : doc.type === 'Checklist' ? 'danger' : 'secondary'}`}>
                                                    {doc.type || 'Guides'}
                                                </span>
                                            </td>
                                            <td>
                                                {getCategoryDisplayName(doc)}
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-end gap-2">
                                                    {doc.file_path && (
                                                        <Button variant="flush-light" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handlePreview(doc.file_path, doc.name)}>
                                                            <span className="icon"><Eye size={20} /></span>
                                                        </Button>
                                                    )}
                                                    <Button variant="flush-light" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleShow(doc)}>
                                                        <span className="icon"><PencilSimple size={20} /></span>
                                                    </Button>
                                                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleDelete(doc.id)}>
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

                    <Modal show={showModal} onHide={handleClose} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{editingId ? 'Edit Document' : 'Add Document'}</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleSubmit}>
                            <Modal.Body>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Document Type</Form.Label>
                                            <Form.Select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                {docTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Main Category</Form.Label>
                                            <Form.Select
                                                value={selectedMainId}
                                                onChange={handleMainCategoryChange}
                                            >
                                                <option value="">Select Category</option>
                                                {mainCategories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    {subCategories.length > 0 && (
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>Sub Category</Form.Label>
                                                <Form.Select
                                                    value={formData.category_id === selectedMainId ? '' : formData.category_id}
                                                    onChange={handleSubCategoryChange}
                                                >
                                                    <option value="">-- No Sub Category (Use Main) --</option>
                                                    {subCategories.map(sub => (
                                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    )}
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Document Name</Form.Label>
                                            <AIFormControl
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                fieldName="Document Name"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Content</Form.Label>
                                            <AITextEnhancer
                                                value={formData.content}
                                                onUpdate={(newContent) => setFormData({ ...formData, content: newContent })}
                                                fieldName="Document Content"
                                                noInputGroup={true}
                                            >
                                                <ReactQuill
                                                    theme="snow"
                                                    value={formData.content}
                                                    onChange={(value) => setFormData({ ...formData, content: value })}
                                                    style={{ height: '200px', marginBottom: '50px' }}
                                                />
                                            </AITextEnhancer>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>
                                                {editingId ? 'Replace Document (Optional)' : 'Upload Document'}
                                            </Form.Label>
                                            <Form.Control
                                                type="file"
                                                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                            />
                                            {editingId && formData.file_path && (
                                                <Form.Text className="text-muted d-block mt-1">
                                                    Current file: <a href={formData.file_path} target="_blank" rel="noopener noreferrer">View</a>
                                                </Form.Text>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                                <Button className="btn-gradient-primary" type="submit" disabled={uploading}>
                                    {uploading ? 'Uploading...' : (editingId ? 'Update Document' : 'Save Document')}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    {/* Document Preview Modal */}
                    {/* Document Preview Modal */}
                    <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="xl" centered style={{ zIndex: 1060 }}>
                        <Modal.Header closeButton className="border-bottom py-3 px-4">
                            <div className="d-flex align-items-center justify-content-between w-100 me-4">
                                <Modal.Title className="h6 mb-0 fw-bold text-truncate" style={{ maxWidth: '60%' }}>
                                    Preview: {previewDocName}
                                </Modal.Title>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="light"
                                        size="sm"
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="d-flex align-items-center gap-2 fw-medium text-dark bg-white border"
                                    >
                                        <ArrowSquareOut size={16} weight="bold" />
                                        <span className="d-none d-sm-inline">Open New Tab</span>
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        href={previewUrl}
                                        download
                                        className="d-flex align-items-center gap-2 fw-medium"
                                    >
                                        <DownloadSimple size={16} weight="bold" />
                                        <span className="d-none d-sm-inline">Download</span>
                                    </Button>
                                </div>
                            </div>
                        </Modal.Header>
                        <Modal.Body className="p-0 position-relative" style={{ height: '85vh', backgroundColor: '#f3f4f6' }}>
                            {previewUrl && (() => {
                                const getFileExtension = (url) => {
                                    if (!url) return '';
                                    // Remove query params
                                    const cleanUrl = url.split('?')[0].split('#')[0];
                                    // Get extension
                                    return cleanUrl.split('.').pop().trim().toLowerCase();
                                };

                                const fileExt = getFileExtension(previewUrl);
                                const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
                                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
                                const pdfExtensions = ['pdf'];

                                if (imageExtensions.includes(fileExt)) {
                                    return (
                                        <div className="d-flex align-items-center justify-content-center h-100 bg-dark">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                            />
                                        </div>
                                    );
                                } else if (pdfExtensions.includes(fileExt)) {
                                    return (
                                        <object
                                            data={previewUrl}
                                            type="application/pdf"
                                            width="100%"
                                            height="100%"
                                        >
                                            <iframe
                                                src={previewUrl}
                                                title="PDF Preview"
                                                style={{ width: '100%', height: '100%', border: 'none' }}
                                            />
                                        </object>
                                    );
                                } else if (officeExtensions.includes(fileExt)) {
                                    // Use Microsoft Office Online Viewer - often more robust for Office files
                                    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`;
                                    return (
                                        <iframe
                                            src={officeViewerUrl}
                                            title="Office Document Preview"
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            loading="lazy"
                                        />
                                    );
                                } else {
                                    // Fallback for unsupported types
                                    return (
                                        <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                            <div className="mb-4 text-center">
                                                <div className="avatar avatar-xl avatar-soft-primary avatar-rounded mb-3 mx-auto">
                                                    <Paperclip size={32} weight="bold" />
                                                </div>
                                                <h5 className="fw-bold mb-1">Preview Unavailable</h5>
                                                <p className="text-muted mb-0">This file type cannot be previewed directly.</p>
                                            </div>
                                            <Button
                                                href={previewUrl}
                                                target="_blank"
                                                variant="primary"
                                                className="btn-lg px-5 btn-rounded shadow-sm"
                                            >
                                                Download File
                                            </Button>
                                        </div>
                                    );
                                }
                            })()}
                        </Modal.Body>
                    </Modal>

                </Card.Body>
            </Card>
        </>
    );
};

export default DocumentList;

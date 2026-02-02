import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
// @ts-ignore
import { supabase } from '../../../../configs/supabaseClient';
// @ts-ignore
import { Folder, Save, ExternalLink } from 'react-feather';
import toast from 'react-hot-toast';

interface Category {
    id: string;
    name: string;
    subcategories: string[];
}

interface Subcategory {
    id: string;
    name: string;
}

interface SaveToCloudModalProps {
    show: boolean;
    onHide: () => void;
    docName: string;
    content: string;
    onSaveSuccess?: () => void;
}

const SaveToCloudModal: React.FC<SaveToCloudModalProps> = ({ show, onHide, docName, content, onSaveSuccess }) => {
    const [documentName, setDocumentName] = useState<string>(docName || '');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchingData, setFetchingData] = useState<boolean>(false);

    // Fetch categories on mount
    useEffect(() => {
        if (show) {
            fetchCategories();
            setDocumentName(docName || '');
        }
    }, [show, docName]);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (selectedCategory) {
            fetchSubcategories(selectedCategory);
        } else {
            setSubcategories([]);
            setSelectedSubcategory('');
        }
    }, [selectedCategory]);

    const fetchCategories = async () => {
        setFetchingData(true);
        try {
            // Fetch from app_document_categories table (from Settings menu)
            const { data, error } = await supabase
                .from('app_document_categories')
                .select('id, name, subcategories')
                .order('name');

            if (error) throw error;

            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
            // Set default categories as fallback
            setCategories([
                { id: 'drafts', name: 'Drafts', subcategories: [] },
                { id: 'legal', name: 'Legal', subcategories: [] },
                { id: 'business', name: 'Business', subcategories: [] },
                { id: 'personal', name: 'Personal', subcategories: [] }
            ]);
        } finally {
            setFetchingData(false);
        }
    };

    const fetchSubcategories = async (categoryId: string) => {
        try {
            // Find the selected category and use its subcategories array
            const selectedCat = categories.find(cat => cat.id === categoryId);

            if (selectedCat && selectedCat.subcategories && selectedCat.subcategories.length > 0) {
                // Convert subcategories array to the format expected by the dropdown
                const subCats = selectedCat.subcategories.map((sub, index) => ({
                    id: sub,
                    name: sub
                }));
                setSubcategories(subCats);
            } else {
                setSubcategories([]);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            setSubcategories([]);
        }
    };

    const handleSave = async () => {
        if (!documentName.trim()) {
            toast.error('Please enter a document name');
            return;
        }

        if (!selectedCategory) {
            toast.error('Please select a category');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Saving to cloud...');

        try {
            const { error } = await supabase.from('app_documents').insert([{
                name: documentName.trim(),
                type: 'AI Generated',
                category: selectedCategory,
                subcategory: selectedSubcategory || null,
                content: content,
                created_at: new Date()
            }]);

            if (error) throw error;

            toast.success('Document saved successfully!', { id: toastId });
            onSaveSuccess?.();
            onHide();
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save document', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleBrowseLibrary = () => {
        // Open library in new tab or navigate
        window.open('/library', '_blank');
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Save to Cloud</Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 py-3">
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Document Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter document name..."
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            className="rounded-3"
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Category</Form.Label>
                                <Form.Select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    disabled={fetchingData}
                                    className="rounded-3"
                                >
                                    <option value="">Select category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Subcategory</Form.Label>
                                <Form.Select
                                    value={selectedSubcategory}
                                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                                    disabled={!selectedCategory || subcategories.length === 0}
                                    className="rounded-3"
                                >
                                    <option value="">Select subcategory...</option>
                                    {subcategories.map(sub => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {selectedCategory && subcategories.length === 0 && (
                                    <Form.Text className="text-muted">
                                        No subcategories available
                                    </Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 align-items-center p-3 bg-light rounded-3 mb-3">
                        <Folder size={18} className="text-muted" />
                        <div className="flex-grow-1">
                            <div className="fw-semibold fs-7">Browse Existing Documents</div>
                            <div className="text-muted fs-8">View your document library</div>
                        </div>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={handleBrowseLibrary}
                            className="rounded-pill"
                        >
                            <ExternalLink size={14} className="me-1" />
                            Open Library
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="light" onClick={onHide} className="rounded-pill px-4">
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading || !documentName.trim() || !selectedCategory}
                    className="rounded-pill px-4"
                >
                    <Save size={16} className="me-2" />
                    {loading ? 'Saving...' : 'Save Document'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SaveToCloudModal;

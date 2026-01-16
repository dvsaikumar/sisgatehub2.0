import React, { useState, useEffect } from 'react';
import { Badge, Card, Col, Row, Button, Modal, Spinner, Offcanvas, Dropdown, Form, InputGroup } from 'react-bootstrap';
import {
    FileText, Envelope, Scroll, ListChecks, CheckSquare, Video,
    Eye, DownloadSimple, Briefcase, Users, CurrencyDollar, ShieldCheck,
    CaretRight, ShareNetwork, Plus, Copy, FilePdf, Paperclip, MagicWand, X, User, ArrowSquareOut, Star
} from '@phosphor-icons/react';

import SimpleBar from 'simplebar-react';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';
import useAuditLog, { AuditActionType, AuditResourceType, AuditActionStatus } from '../../hooks/useAuditLog';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import AIFormControl from '../../components/AIFormControl/AIFormControl';
import AITextEnhancer from '../../components/AIEnhancer/AITextEnhancer';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { renderAsync } from 'docx-preview';

const LibraryList = ({ filter, searchTerm, toggleInfo }) => {
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [showFilePreview, setShowFilePreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewDocName, setPreviewDocName] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeType, setActiveType] = useState('All');
    const [pdfConfig, setPdfConfig] = useState(null);

    // Share Modal States
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareType, setShareType] = useState('doc'); // 'doc' or 'pdf'
    const [allUsers, setAllUsers] = useState([]);
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [shareForm, setShareForm] = useState({
        recipients: [],
        subject: '',
        template_id: '',
        content: '',
        attachment: null
    });

    // Template Modal States
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateBlob, setTemplateBlob] = useState(null);
    const [templatePreviewUrl, setTemplatePreviewUrl] = useState(null);
    const [templateHtml, setTemplateHtml] = useState('');
    const [templateKeys, setTemplateKeys] = useState([]);
    const [templateDelimiters, setTemplateDelimiters] = useState({ start: '{', end: '}' });
    const [templateData, setTemplateData] = useState({});
    const [selectedFillUser, setSelectedFillUser] = useState(null);
    const previewContainerRef = React.useRef(null);

    useEffect(() => {
        fetchData();
        fetchShareDependencies();
    }, []);

    // Debounced Effect for Real-Time Template Preview
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only update if we have data and the modal is open
            if (showTemplateModal && templateBlob) {
                updateTemplatePreview(templateData, templateBlob, templateDelimiters);
            }
        }, 800); // 800ms delay to make typing smooth

        return () => clearTimeout(timer);
    }, [templateData]); // Intentionally not including other deps to avoid unnecessary re-renders

    const fetchShareDependencies = async () => {
        try {
            const [usersRes, templatesRes, pdfRes] = await Promise.all([
                supabase.from('user_profiles').select('id, full_name, email'),
                supabase.from('app_templates').select('id, name, content').eq('type', 'Email'),
                supabase.from('app_pdf_configs').select('*').limit(1).single()
            ]);
            setAllUsers(usersRes.data || []);
            setEmailTemplates(templatesRes.data || []);
            if (pdfRes.data) setPdfConfig(pdfRes.data);
        } catch (error) {
            console.error('Error fetching share dependencies:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [docsRes, catsRes] = await Promise.all([
                supabase.from('app_documents').select('id, name, type, category_id, file_path, created_at, content, is_starred'),
                supabase.from('app_document_categories').select('*')
            ]);

            if (docsRes.error) throw docsRes.error;
            if (catsRes.error) throw catsRes.error;

            setDocuments(docsRes.data || []);
            setCategories(catsRes.data || []);
        } catch (error) {
            console.error('Error fetching library data:', error);
        } finally {
            setLoading(false);
        }
    };

    const types = ["All", "Guides", "Templates", "Letters", "Step By Step", "Checklist", "Videos", "Others"];

    const getTypeStyles = (type) => {
        const t = type?.toLowerCase();
        if (t?.includes('letter')) return { variant: 'info', icon: Envelope };
        if (t?.includes('guide')) return { variant: 'primary', icon: Scroll };
        if (t?.includes('step') || t?.includes('checklist')) return { variant: 'success', icon: ListChecks };
        if (t?.includes('video')) return { variant: 'indigo', icon: Video };
        if (t?.includes('template')) return { variant: 'warning', icon: FileText };
        return { variant: 'secondary', icon: FileText };
    }

    const getCategoryName = (id) => {
        const cat = categories.find(c => c.id === id);
        return cat ? cat.name : 'Uncategorized';
    };

    const getCategoryPath = (categoryId) => {
        const path = [];
        let current = categories.find(c => c.id === categoryId);
        while (current) {
            path.unshift(current.name);
            current = categories.find(c => c.id === current.parent_id);
        }
        return path;
    };

    // 1. First, filter by Category (Sidebar) and Search only to find which types are available
    const baseFilteredDocs = documents.filter(item => {
        let matchesSidebarFilter = true;
        if (filter !== 'all') {
            if (filter === 'starred') {
                matchesSidebarFilter = item.is_starred === true;
            } else if (filter === 'trash') {
                matchesSidebarFilter = false;
            } else {
                matchesSidebarFilter = item.category_id === filter;
            }
        }
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSidebarFilter && matchesSearch;
    });


    // 2. Identify distinct types present in the base filtered list
    const presentTypes = new Set(baseFilteredDocs.map(doc => doc.type));

    // Mapping between UI labels and DB type values
    const typeValueMap = {
        'Templates': 'Templates',
        'Letters': 'Letters',
        'Guides': 'Guides',
        'Step By Step': 'Step by Step',
        'Checklist': 'Checklist',
        'Videos': 'Videos'
    };

    // Filter the static types list to hide empty categories
    const visibleTypes = types.filter(type =>
        type === 'All' || presentTypes.has(type) || presentTypes.has(typeValueMap[type])
    );

    // 3. Final data filtered by the selected horizontal type
    const sortedData = baseFilteredDocs.filter(item => {
        if (activeType === 'All') return true;
        const targetType = typeValueMap[activeType] || activeType;
        return item.type === targetType;
    });

    const getTypeCount = (type) => {
        if (type === 'All') return baseFilteredDocs.length;
        const targetType = typeValueMap[type] || type;
        return baseFilteredDocs.filter(doc => doc.type === targetType).length;
    };

    const handleToggleStar = async (e, item) => {
        e.stopPropagation(); // Prevent card click from triggering
        const newStarredState = !item.is_starred;

        // Optimistic update
        setDocuments(prev => prev.map(doc =>
            doc.id === item.id ? { ...doc, is_starred: newStarredState } : doc
        ));

        try {
            const { error } = await supabase
                .from('app_documents')
                .update({ is_starred: newStarredState })
                .eq('id', item.id);

            if (error) throw error;

            toast.success(newStarredState ? 'Added to favorites' : 'Removed from favorites');
        } catch (error) {
            // Rollback on error
            setDocuments(prev => prev.map(doc =>
                doc.id === item.id ? { ...doc, is_starred: !newStarredState } : doc
            ));
            toast.error('Failed to update favorite status');
            console.error('Error toggling star:', error);
        }
    };


    const handlePreview = async (item) => {
        setSelectedItem(item);
        setShowPreview(true);

        // Fetch full content if not already available
        if (!item.content) {
            try {
                const { data, error } = await supabase
                    .from('app_documents')
                    .select('content')
                    .eq('id', item.id)
                    .single();

                if (error) throw error;

                // Update the selected item and the local list with the content
                setSelectedItem(prev => ({ ...prev, content: data.content }));
                setDocuments(prev => prev.map(doc =>
                    doc.id === item.id ? { ...doc, content: data.content } : doc
                ));
            } catch (error) {
                console.error('Error fetching document content:', error);
            }
        }
    };

    const handleCopy = () => {
        if (!selectedItem?.content) {
            toast.error('No content available to copy');
            return;
        }
        const plainText = selectedItem.content.replace(/<[^>]+>/g, '');
        navigator.clipboard.writeText(plainText);
        toast.success('Template content copied to clipboard!');
    };

    const handleShareEmail = (type) => {
        if (!selectedItem) return;
        setShareType(type);
        setShareForm({
            recipients: [],
            subject: selectedItem.name,
            template_id: '',
            content: '', // Start with empty content as requested
            attachment: selectedItem
        });
        setShowShareModal(true);
    };

    const handleTemplateChange = (templateId) => {
        if (!templateId) {
            // Clear content if "Plain Composition" is selected
            setShareForm(prev => ({ ...prev, template_id: '', content: '' }));
            return;
        }

        const template = emailTemplates.find(t => t.id === templateId);
        if (template) {
            // Simple replace variables for demo
            let content = template.content.replace(/<[^>]+>/g, ''); // Ensure template content is also cleaned
            content = content.replace('{{document_name}}', selectedItem?.name || '');
            setShareForm(prev => ({ ...prev, template_id: templateId, content }));
        }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        if (shareForm.recipients.length === 0) {
            toast.error('Please add at least one recipient');
            return;
        }

        try {
            setSendingEmail(true);
            const loadToast = toast.loading(`Preparing ${shareType.toUpperCase()} and sending...`);

            // Simulate conversion if PDF
            if (shareType === 'pdf') {
                const doc = new jsPDF();
                const plainText = shareForm.content.replace(/<[^>]+>/g, '');
                const splitTitle = doc.splitTextToSize(shareForm.subject, 180);
                const splitText = doc.splitTextToSize(plainText, 180);
                doc.text(splitTitle, 10, 10);
                doc.text(splitText, 10, 20);
                // In a real app, we'd upload this to storage or send to backend
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            toast.success('Email sent successfully!', { id: loadToast });
            setShowShareModal(false);

            // Log audit action
            await useAuditLog.logAuditAction({
                actionType: 'SEND_EMAIL',
                resourceType: AuditResourceType.DOCUMENT,
                resourceId: selectedItem?.id,
                resourceName: selectedItem?.name,
                actionDescription: `Shared document via email: ${shareType}`,
                actionStatus: AuditActionStatus.SUCCESS
            });
        } catch (error) {
            toast.error('Failed to send email');
            // Log failure
            await useAuditLog.logAuditAction({
                actionType: 'SEND_EMAIL',
                resourceType: AuditResourceType.DOCUMENT,
                resourceId: selectedItem?.id,
                resourceName: selectedItem?.name,
                actionDescription: `Failed to share document: ${error.message}`,
                actionStatus: AuditActionStatus.FAILED
            });
        } finally {
            setSendingEmail(false);
        }
    };

    const handleFilePreview = (url, name) => {
        setPreviewUrl(url);
        setPreviewDocName(name);
        setShowFilePreview(true);
    };

    const handleDownload = async () => {
        if (!selectedItem) return;

        // Helper to sanitize filename
        const safeName = (selectedItem.name || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();

        if (selectedItem.file_path) {
            // Direct download for original attachment
            // Chrome won't download cross-origin links nicely, so we fetch as blob
            const toastId = toast.loading('Preparing download...');
            try {
                // Get the public URL first
                const publicUrl = selectedItem.file_path.startsWith('http')
                    ? selectedItem.file_path
                    : supabase.storage.from('documents').getPublicUrl(selectedItem.file_path).data.publicUrl;

                const response = await fetch(publicUrl);
                if (!response.ok) throw new Error('Fetch failed');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                // Try to preserve original extension or default to bin
                const ext = selectedItem.file_path.split('.').pop();
                link.download = `${safeName}.${ext}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                window.URL.revokeObjectURL(url);
                toast.success('Download started', { id: toastId });

                // Log download action
                await useAuditLog.logExport(
                    AuditResourceType.DOCUMENT,
                    selectedItem.name,
                    'file',
                    { document_id: selectedItem.id }
                );
            } catch (error) {
                console.error('Download error:', error);
                toast.error('Failed to download file', { id: toastId });
            }
        } else if (selectedItem.content) {
            // Generate PDF from content using pdfConfig
            const defaultPdfConfig = {
                page_size: 'a4',
                orientation: 'portrait',
                unit: 'mm',
                font_family: 'helvetica',
                font_size: 11,
                font_color: '#333333',
                line_height: 1.5,
                margin_top: 20,
                margin_bottom: 20,
                margin_left: 20,
                margin_right: 20,
                header_enabled: false,
                header_text: 'Document',
                header_align: 'center',
                header_font_size: 9,
                footer_enabled: true,
                footer_text: 'Confidential | Page {page_number} of {total_pages}',
                footer_align: 'center',
                footer_font_size: 9
            };

            // Use fetched config if available, but ensure NUMBERS are parsed
            const rawConfig = pdfConfig || defaultPdfConfig;
            const config = {
                ...rawConfig,
                font_size: Number(rawConfig.font_size) || 11,
                line_height: Number(rawConfig.line_height) || 1.5,
                margin_top: Number(rawConfig.margin_top) || 20,
                margin_bottom: Number(rawConfig.margin_bottom) || 20,
                margin_left: Number(rawConfig.margin_left) || 20,
                margin_right: Number(rawConfig.margin_right) || 20,
                header_font_size: Number(rawConfig.header_font_size) || 9,
                footer_font_size: Number(rawConfig.footer_font_size) || 9,
                border_width: Number(rawConfig.border_width) || 1
            };

            const doc = new jsPDF({
                orientation: config.orientation,
                unit: config.unit,
                format: config.page_size
            });

            try {
                // Calculate content width
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const contentWidth = pageWidth - (config.margin_left + config.margin_right);

                // HELPER: Add Page Numbers & Footer to ALL pages
                const addFooters = () => {
                    const totalPages = doc.internal.getNumberOfPages();
                    for (let i = 1; i <= totalPages; i++) {
                        doc.setPage(i);

                        // Footer
                        if (config.footer_enabled) {
                            // Map safe font
                            let safeFont = config.font_family;
                            if (!['helvetica', 'times', 'courier'].includes(safeFont)) safeFont = 'helvetica';

                            doc.setFont(safeFont, 'normal');
                            doc.setFontSize(config.footer_font_size);
                            doc.setTextColor(config.font_color);

                            let x = config.margin_left;
                            if (config.footer_align === 'center') x = pageWidth / 2;
                            if (config.footer_align === 'right') x = pageWidth - config.margin_right;

                            const footerText = config.footer_text
                                .replace('{page_number}', i.toString())
                                .replace('{total_pages}', totalPages.toString());

                            doc.text(footerText, x, pageHeight - (config.margin_bottom / 2), { align: config.footer_align });
                        }

                        // Border
                        if (config.border_enabled) {
                            doc.setDrawColor(config.border_color);
                            doc.setLineWidth(config.border_width / 2);
                            doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
                        }


                        // Header (if enabled, ensuring it's on every page)
                        if (config.header_enabled) {
                            // Map safe font
                            let safeFont = config.font_family;
                            if (!['helvetica', 'times', 'courier'].includes(safeFont)) safeFont = 'helvetica';

                            doc.setFont(safeFont, 'normal');
                            doc.setFontSize(config.header_font_size);
                            doc.setTextColor(config.font_color);

                            let x = config.margin_left;
                            if (config.header_align === 'center') x = pageWidth / 2;
                            if (config.header_align === 'right') x = pageWidth - config.margin_right;
                            doc.text(config.header_text, x, config.margin_top / 2, { align: config.header_align });
                        }
                    }
                };

                // Improved Content Processing
                const splitContentToLines = (htmlContent) => {
                    // Replace paragraphs and breaks with newlines
                    let text = htmlContent
                        .replace(/<br\s*\/?>/gi, '\n')
                        .replace(/<\/p>/gi, '\n\n')
                        .replace(/<[^>]+>/g, '') // Strip remaining tags
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>');

                    // use jsPDF to split long lines based on width
                    // Map safe font
                    let safeFont = config.font_family;
                    if (!['helvetica', 'times', 'courier'].includes(safeFont)) safeFont = 'helvetica';

                    doc.setFontSize(config.font_size);
                    doc.setFont(safeFont, 'normal');
                    return doc.splitTextToSize(text, contentWidth);
                };

                const handleAddContent = () => {
                    // Map safe font
                    let safeFont = config.font_family;
                    if (!['helvetica', 'times', 'courier'].includes(safeFont)) safeFont = 'helvetica';

                    doc.setFontSize(config.font_size);
                    doc.setFont(safeFont, 'normal');
                    doc.setTextColor(config.font_color);

                    const lines = splitContentToLines(selectedItem.content);
                    const lineHeightPoints = config.font_size * (config.line_height || 1.15);
                    const lineHeightMM = lineHeightPoints * 0.352778; // Conversion factor points to mm

                    let cursorY = config.margin_top + 25; // Initial Start Y (allowing for Title)

                    lines.forEach((line) => {
                        // Check if we need a new page
                        if (cursorY + lineHeightMM > pageHeight - config.margin_bottom) {
                            doc.addPage();
                            cursorY = config.margin_top + 10; // Reset Y for new page
                        }
                        doc.text(line, config.margin_left, cursorY);
                        cursorY += lineHeightMM;
                    });
                };

                // --- EXECUTE GENERATION ---

                // 1. Title Page / First Page Header
                // Map safe font
                let safeFont = config.font_family;
                if (!['helvetica', 'times', 'courier'].includes(safeFont)) safeFont = 'helvetica';

                doc.setFontSize(config.font_size + 6);
                doc.setFont(safeFont, 'bold');
                doc.setTextColor(config.font_color);
                const splitTitle = doc.splitTextToSize(selectedItem.name, contentWidth);
                doc.text(splitTitle, config.margin_left, config.margin_top + 10);

                // 2. Add Content with Pagination
                handleAddContent();

                // 3. Add Decorations to ALL pages
                addFooters();

                doc.save(`${safeName}.pdf`);
                toast.success('PDF generated with custom design!');

                await useAuditLog.logExport(
                    AuditResourceType.DOCUMENT,
                    selectedItem.name,
                    'pdf',
                    { document_id: selectedItem.id }
                );
            } catch (error) {
                console.error('PDF Generation Error:', error);
                toast.error('Failed to generate PDF. check console for details.');
            }
        } else {
            toast.error('No content available to download');
        }
    };

    return (
        <div className="fm-body">
            <style>
                {`
                /* ========================================
                   MODERN LIBRARY REDESIGN - Premium UI
                   ======================================== */
                
                /* Filter Pills */
                .filter-badge {
                    font-size: 10px;
                    padding: 2px 7px;
                    border-radius: 20px;
                    margin-left: 6px;
                    background: rgba(0,0,0,0.06);
                    color: inherit;
                    vertical-align: middle;
                    font-weight: 700;
                }
                .btn-primary .filter-badge {
                    background: rgba(255,255,255,0.25);
                    color: white;
                }
                .filter-btn {
                    font-size: 0.8rem !important;
                    padding: 0.5rem 1.25rem !important;
                    font-weight: 600;
                    border-radius: 50px !important;
                    letter-spacing: 0.02em;
                }
                
                /* Library Cards - Refined */
                .library-card {
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(0,0,0,0.06) !important;
                    overflow: hidden;
                    border-radius: 16px !important;
                    background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
                }
                .library-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 40px rgba(0, 125, 136, 0.12), 0 8px 16px rgba(0,0,0,0.06) !important;
                    border-color: rgba(0, 125, 136, 0.3) !important;
                }
                .card-icon-wrap {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 14px;
                    background: linear-gradient(135deg, rgba(0, 125, 136, 0.08) 0%, rgba(0, 125, 136, 0.04) 100%);
                    border-radius: 10px;
                    color: #007D88 !important;
                    transition: all 0.3s ease;
                }
                .card-icon-wrap svg {
                    color: #007D88 !important;
                }
                .library-card:hover .card-icon-wrap {
                    background: linear-gradient(135deg, rgba(0, 125, 136, 0.15) 0%, rgba(0, 125, 136, 0.08) 100%);
                    transform: scale(1.05);
                }
                .rich-text-preview {
                    color: #64748b;
                    line-height: 1.65;
                    font-size: 0.875rem;
                }
                .rich-text-preview * {
                    font-size: inherit !important;
                    color: inherit !important;
                }
                .rich-text-preview p {
                    margin-bottom: 0.25rem;
                }
                
                /* ========================================
                   PREMIUM DRAWER - Complete Redesign
                   ======================================== */
                .library-drawer {
                    width: 52% !important;
                    max-width: 720px;
                    border: none !important;
                    box-shadow: -24px 0 64px rgba(0,0,0,0.12), -8px 0 24px rgba(0,0,0,0.06);
                    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    border-radius: 24px 0 0 24px;
                    overflow: hidden;
                }
                .library-drawer.offcanvas-end {
                    transform: translateX(100%);
                }
                .library-drawer.show {
                    transform: translateX(0);
                }
                .library-drawer .offcanvas-body {
                    padding: 0 !important;
                }
                
                /* Modern Header */
                .drawer-header-modern {
                    padding: 2rem 2.25rem 1.75rem;
                    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
                    border-bottom: 1px solid rgba(0,0,0,0.04);
                    position: relative;
                }
                .drawer-handle {
                    width: 36px;
                    height: 4px;
                    background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
                    border-radius: 4px;
                    position: absolute;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                }
                .drawer-close-btn {
                    position: absolute;
                    top: 1.25rem;
                    right: 1.25rem;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    color: #64748b;
                }
                .drawer-close-btn:hover {
                    background: linear-gradient(145deg, #fee2e2 0%, #fecaca 100%);
                    color: #dc2626;
                    transform: rotate(90deg);
                }
                .drawer-category-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    background: linear-gradient(135deg, rgba(0, 125, 136, 0.08) 0%, rgba(0, 125, 136, 0.04) 100%);
                    border-radius: 24px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #007D88;
                    margin-bottom: 16px;
                }
                .category-dot {
                    width: 6px;
                    height: 6px;
                    background: #007D88;
                    border-radius: 50%;
                }
                .drawer-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 12px 0;
                    line-height: 1.2;
                    letter-spacing: -0.02em;
                }
                .drawer-type-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    background: #f1f5f9;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #475569;
                }
                
                /* Body - Modern Stats Row */
                .drawer-body-modern {
                    padding: 0 !important;
                    background: #f8fafc;
                    overflow-y: auto;
                    flex: 1;
                }
                .drawer-stats-row {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    padding: 1rem 2.25rem;
                    background: white;
                    border-bottom: 1px solid rgba(0,0,0,0.04);
                }
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748b;
                    padding: 0 1.5rem;
                }
                .stat-item:first-child {
                    padding-left: 0;
                }
                .stat-item svg {
                    color: #007D88;
                }
                .stat-divider {
                    width: 1px;
                    height: 20px;
                    background: #e2e8f0;
                }
                
                /* Content Preview Card */
                .content-preview-card {
                    margin: 1.75rem 2.25rem;
                    background: white;
                    border-radius: 16px;
                    border: 1px solid rgba(0,0,0,0.04);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02);
                    overflow: hidden;
                }
                .content-preview-header {
                    padding: 1rem 1.5rem;
                    background: linear-gradient(180deg, #fafbfc 0%, #f8fafc 100%);
                    border-bottom: 1px solid rgba(0,0,0,0.04);
                }
                .preview-label {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #94a3b8;
                }
                .content-preview-body {
                    padding: 2rem;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .preview-text {
                    font-size: 0.9375rem;
                    line-height: 1.8;
                    color: #334155;
                }
                .preview-text h1, .preview-text h2, .preview-text h3 {
                    color: #0f172a;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .preview-text p {
                    margin-bottom: 1rem;
                }
                .preview-text ul, .preview-text ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .preview-text li {
                    margin-bottom: 0.5rem;
                }
                .preview-text table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1rem 0;
                    font-size: 0.875rem;
                }
                .preview-text th, .preview-text td {
                    border: 1px solid #e2e8f0;
                    padding: 0.75rem;
                    text-align: left;
                }
                .preview-text th {
                    background: #f8fafc;
                    font-weight: 600;
                }
                .preview-text blockquote {
                    border-left: 3px solid #007D88;
                    padding-left: 1rem;
                    margin: 1rem 0;
                    color: #64748b;
                    font-style: italic;
                }
                .preview-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 3rem;
                    color: #94a3b8;
                }
                
                /* Attachment Card */
                .attachment-card {
                    margin: 0 2.25rem 1.75rem;
                    padding: 1rem 1.25rem;
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, rgba(239, 68, 68, 0.02) 100%);
                    border: 1px solid rgba(239, 68, 68, 0.1);
                    border-radius: 12px;
                    transition: all 0.25s ease;
                }
                .attachment-card:hover {
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%);
                    border-color: rgba(239, 68, 68, 0.2);
                }
                .attachment-info {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .attachment-icon {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%);
                    border-radius: 10px;
                    color: #dc2626;
                }
                .attachment-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .attachment-label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1e293b;
                }
                .attachment-action {
                    font-size: 12px;
                    font-weight: 600;
                    color: #dc2626;
                    cursor: pointer;
                    transition: color 0.2s ease;
                }
                .attachment-action:hover {
                    color: #b91c1c;
                    text-decoration: underline;
                }
                
                /* Modern Footer */
                .drawer-footer-modern {
                    padding: 1.5rem 2.25rem;
                    background: white;
                    border-top: 1px solid rgba(0,0,0,0.04);
                    box-shadow: 0 -8px 24px rgba(0,0,0,0.03);
                }
                .primary-action-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, #007D88 0%, #006670 100%);
                    border: none;
                    border-radius: 14px;
                    font-size: 15px;
                    font-weight: 700;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 16px rgba(0, 125, 136, 0.25);
                    margin-bottom: 1rem;
                }
                .primary-action-btn:hover {
                    background: linear-gradient(135deg, #006670 0%, #005560 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 125, 136, 0.35);
                }
                .primary-action-btn:active {
                    transform: translateY(0);
                }
                .secondary-actions-row {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 10px;
                }
                .secondary-action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 0.875rem 1.25rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .secondary-action-btn:hover {
                    background: #007D88;
                    border-color: #007D88;
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 125, 136, 0.2);
                }
                .secondary-action-btn:hover svg {
                    color: white !important;
                }
                .secondary-action-dropdown {
                    flex: 1;
                }
                .secondary-action-dropdown .dropdown-toggle {
                    width: 100%;
                }
                .secondary-action-dropdown .dropdown-toggle::after {
                    display: none;
                }
                .modern-dropdown-menu {
                    padding: 8px;
                    border-radius: 12px;
                    border: 1px solid rgba(0,0,0,0.06);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                }
                .modern-dropdown-menu .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }
                .modern-dropdown-menu .dropdown-item:hover {
                    background: linear-gradient(135deg, rgba(0, 125, 136, 0.08) 0%, rgba(0, 125, 136, 0.04) 100%);
                }
                .modern-dropdown-menu .dropdown-item svg {
                    color: #64748b;
                }
                
                /* Responsive */
                @media (max-width: 992px) {
                    .library-drawer {
                        width: 80% !important;
                        max-width: none;
                        border-radius: 20px 0 0 20px;
                    }
                }
                @media (max-width: 768px) {
                    .library-drawer {
                        width: 100% !important;
                        border-radius: 20px 20px 0 0;
                    }
                    .drawer-header-modern {
                        padding: 1.5rem 1.5rem 1.25rem;
                    }
                    .drawer-title {
                        font-size: 1.35rem;
                    }
                    .content-preview-card {
                        margin: 1.25rem 1.5rem;
                    }
                    .drawer-stats-row {
                        padding: 0.875rem 1.5rem;
                    }
                    .attachment-card {
                        margin: 0 1.5rem 1.25rem;
                    }
                    .drawer-footer-modern {
                        padding: 1.25rem 1.5rem;
                    }
                    .secondary-actions-row {
                        grid-template-columns: 1fr 1fr;
                    }
                    .secondary-action-dropdown {
                        grid-column: span 2;
                    }
                }
                `}
            </style>

            <SimpleBar className="nicescroll-bar">
                <div className="file-list-view p-3">
                    <div className="d-flex flex-nowrap overflow-auto mb-4 pb-2 user-select-none" style={{ scrollbarWidth: 'none' }}>
                        {visibleTypes.map(type => (
                            <Button
                                key={type}
                                variant={activeType === type ? "primary" : "soft-secondary"}
                                className="btn-rounded flex-shrink-0 me-2 d-flex align-items-center filter-btn"
                                size="sm"
                                onClick={() => setActiveType(type)}
                            >
                                {type}
                                <span className="filter-badge">
                                    <b>{getTypeCount(type)}</b>
                                </span>
                            </Button>
                        ))}
                    </div>
                    <Row>
                        {loading ? (
                            <Col className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2">Loading library...</p>
                            </Col>
                        ) : sortedData.length === 0 ? (
                            <Col className="text-center py-5">
                                <p className="text-muted">No documents found matching your criteria.</p>
                            </Col>
                        ) : (
                            sortedData.map(item => {
                                const styles = getTypeStyles(item.type);
                                const IconComponent = styles.icon;
                                return (
                                    <Col xl={3} lg={3} md={6} sm={12} key={item.id} className="mb-4">
                                        <Card className="h-100 library-card shadow-sm border" onClick={() => handlePreview(item)} style={{ cursor: 'pointer' }}>
                                            <Card.Header className="bg-light border-bottom d-flex align-items-center py-2 px-4" style={{ minHeight: '50px' }}>
                                                <div className="card-icon-wrap transition-all">
                                                    <IconComponent size={20} weight="bold" />
                                                </div>
                                                <h6 className="mb-0 text-truncate fw-bold flex-1" style={{ color: '#1a1a1a', fontSize: '16px' }} title={item.name}>{item.name}</h6>
                                            </Card.Header>
                                            <Card.Body className="pt-3 pb-4 px-4 flex-grow-1">
                                                <div
                                                    className="fs-7 text-secondary rich-text-preview"
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'normal',
                                                        maxHeight: '4.5em',
                                                        lineHeight: '1.5em',
                                                        color: '#525c68'
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: item.content || 'No description provided for this template.' }}
                                                />
                                            </Card.Body>
                                            <Card.Footer className="bg-light border-top d-flex justify-content-between align-items-center py-2 px-4" style={{ minHeight: '50px' }}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <button
                                                        className="btn btn-link p-0 d-flex align-items-center"
                                                        onClick={(e) => handleToggleStar(e, item)}
                                                        style={{ color: item.is_starred ? '#f59e0b' : '#94a3b8', transition: 'color 0.2s' }}
                                                        title={item.is_starred ? 'Remove from favorites' : 'Add to favorites'}
                                                    >
                                                        <Star size={18} weight={item.is_starred ? 'fill' : 'regular'} />
                                                    </button>
                                                    <small className="fw-bold text-primary" style={{ color: '#007D88 !important' }}>{getCategoryName(item.category_id)}</small>
                                                </div>
                                                <Badge bg="dark" className="badge-sm text-capitalize px-2 py-1" style={{ fontSize: '10px', fontWeight: '600' }}>
                                                    {item.type || 'General'}
                                                </Badge>
                                            </Card.Footer>

                                        </Card>
                                    </Col>
                                )
                            })
                        )}
                    </Row>
                </div>
            </SimpleBar>

            {/* Preview Drawer - Modern Design */}
            <Offcanvas
                show={showPreview}
                onHide={() => setShowPreview(false)}
                placement="end"
                className="library-drawer"
                backdrop={true}
            >
                {/* Modern Header */}
                <div className="drawer-header-modern">
                    <div className="drawer-handle" />
                    <button
                        className="drawer-close-btn"
                        onClick={() => setShowPreview(false)}
                        aria-label="Close"
                    >
                        <X size={20} weight="bold" />
                    </button>

                    {/* Category Badge */}
                    <div className="drawer-category-badge">
                        <span className="category-dot" />
                        <span>{getCategoryPath(selectedItem?.category_id).join(' › ') || 'Library'}</span>
                    </div>

                    {/* Title */}
                    <h2 className="drawer-title">{selectedItem?.name}</h2>

                    {/* Type Tag */}
                    <div className="drawer-type-tag">
                        <FileText size={14} weight="bold" />
                        <span>{selectedItem?.type || 'Document'}</span>
                    </div>
                </div>

                {/* Content Body */}
                <Offcanvas.Body className="drawer-body-modern">
                    {/* Quick Stats */}
                    <div className="drawer-stats-row">
                        <div className="stat-item">
                            <Eye size={16} />
                            <span>Preview</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <FileText size={16} />
                            <span>{selectedItem?.type}</span>
                        </div>
                    </div>

                    {/* Content Preview Card */}
                    <div className="content-preview-card">
                        <div className="content-preview-header">
                            <span className="preview-label">Document Preview</span>
                        </div>
                        <div className="content-preview-body">
                            {selectedItem?.content ? (
                                <div
                                    className="preview-text"
                                    dangerouslySetInnerHTML={{ __html: selectedItem?.content }}
                                />
                            ) : (
                                <div className="preview-loading">
                                    <Spinner animation="border" variant="primary" size="sm" />
                                    <span>Loading content...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Original Attachment Card */}
                    {selectedItem?.file_path && (
                        <div className="attachment-card">
                            <div className="attachment-info">
                                <div className="attachment-icon">
                                    <Paperclip size={18} weight="bold" />
                                </div>
                                <div className="attachment-text">
                                    <span className="attachment-label">Attached File</span>
                                    <span className="attachment-action" onClick={() => handleFilePreview(selectedItem.file_path, selectedItem.name)}>
                                        View Original →
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </Offcanvas.Body>

                {/* Modern Footer */}
                <div className="drawer-footer-modern">
                    {/* Primary Action */}
                    {(selectedItem?.type === 'Templates' || selectedItem?.file_path) && (
                        <button
                            className="primary-action-btn"
                            onClick={() => handleUseTemplate()}
                        >
                            <MagicWand size={20} weight="bold" />
                            <span>Use This Template</span>
                        </button>
                    )}

                    {/* Secondary Actions Row */}
                    <div className="secondary-actions-row">
                        <button className="secondary-action-btn" onClick={handleCopy}>
                            <Copy size={18} weight="bold" />
                            <span>Copy</span>
                        </button>

                        <Dropdown className="secondary-action-dropdown">
                            <Dropdown.Toggle as="button" className="secondary-action-btn">
                                <ShareNetwork size={18} weight="bold" />
                                <span>Share</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="modern-dropdown-menu">
                                <Dropdown.Item onClick={() => handleShareEmail('doc')}>
                                    <FileText size={16} />
                                    <span>Email as Document</span>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleShareEmail('pdf')}>
                                    <FilePdf size={16} />
                                    <span>Email as PDF</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <button className="secondary-action-btn" onClick={handleDownload}>
                            <DownloadSimple size={18} weight="bold" />
                            <span>Download</span>
                        </button>
                    </div>
                </div>
            </Offcanvas>

            {/* Document Preview Modal */}

            <Modal show={showFilePreview} onHide={() => setShowFilePreview(false)} size="xl" centered style={{ zIndex: 1060 }}>
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

            {/* Email Share Modal */}
            <Modal show={showShareModal} onHide={() => setShowShareModal(false)} size="lg" centered className="modal-rounded">
                <Modal.Header closeButton className="border-bottom-0 pt-4 px-4">
                    <div className="d-flex align-items-center">
                        <div className={`avatar avatar-sm avatar-soft-${shareType === 'pdf' ? 'danger' : 'primary'} avatar-rounded me-3`}>
                            {shareType === 'pdf' ? <FilePdf size={20} weight="fill" /> : <Envelope size={20} weight="fill" />}
                        </div>
                        <div>
                            <Modal.Title className="fs-5 fw-bold">Share via Email {shareType === 'pdf' ? '(as PDF)' : '(as Doc)'}</Modal.Title>
                            <p className="text-muted small mb-0">Compose and send your {shareType === 'pdf' ? 'document' : 'template'} safely.</p>
                        </div>
                    </div>
                </Modal.Header>
                <Form onSubmit={handleSendEmail}>
                    <Modal.Body className="p-4">
                        <Row className="g-4">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold fs-13px text-uppercase tracking-wider text-muted mb-2">Recipients</Form.Label>
                                    <Select
                                        isMulti
                                        options={allUsers.map(u => ({ value: u.email, label: `${u.full_name} (${u.email})`, isUser: true }))}
                                        placeholder="Enter email manually or choose from users..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        onChange={(opt) => setShareForm({ ...shareForm, recipients: opt })}
                                        formatCreateLabel={(inputValue) => `Add manually: ${inputValue}`}
                                        noOptionsMessage={() => "No users found. Type a custom email."}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: '12px',
                                                padding: '4px',
                                                border: '1px solid #e0e2e4',
                                                boxShadow: 'none',
                                                '&:hover': { border: '1px solid #007D88' }
                                            }),
                                            multiValue: (base) => ({
                                                ...base,
                                                backgroundColor: '#f1f2f4',
                                                borderRadius: '8px',
                                            })
                                        }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold fs-13px text-uppercase tracking-wider text-muted mb-2">Subject Line</Form.Label>
                                    <AIFormControl
                                        type="text"
                                        value={shareForm.subject}
                                        onChange={(e) => setShareForm({ ...shareForm, subject: e.target.value })}
                                        placeholder="Email Subject"
                                        fieldName="Email Subject"
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold fs-13px text-uppercase tracking-wider text-muted mb-2">Email Template</Form.Label>
                                    <Form.Select
                                        value={shareForm.template_id}
                                        onChange={(e) => handleTemplateChange(e.target.value)}
                                        className="rounded-3"
                                    >
                                        <option value="">-- Plain Composition --</option>
                                        {emailTemplates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <div
                                    className="p-3 rounded-3 bg-light border border-dashed h-100 d-flex align-items-center cursor-pointer transition-all"
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f0f7f8';
                                        e.currentTarget.style.borderColor = '#007D88';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#e0e2e4';
                                    }}
                                    onClick={() => {
                                        if (selectedItem?.file_path) {
                                            handleFilePreview(selectedItem.file_path, selectedItem.name);
                                        } else {
                                            toast.error('No original file found for this template');
                                        }
                                    }}
                                    title="Click to preview document"
                                >
                                    <div className="d-flex align-items-center gap-3 w-100">
                                        <div className={`avatar avatar-xs avatar-soft-${shareType === 'pdf' ? 'danger' : 'info'} avatar-rounded flex-shrink-0`}>
                                            {shareType === 'pdf' ? <FilePdf size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div className="flex-grow-1 mnw-0">
                                            <div className="text-high-em fw-bold fs-13px text-truncate">{selectedItem?.name}</div>
                                            <div className="text-muted fs-11px">{shareType === 'pdf' ? 'Will be converted to PDF' : 'Clean document content'}</div>
                                        </div>
                                        <Eye size={18} className="text-primary" weight="bold" />
                                    </div>
                                </div>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold fs-13px text-uppercase tracking-wider text-muted mb-2">Email Content</Form.Label>
                                    <AIFormControl
                                        as="textarea"
                                        rows={6}
                                        value={shareForm.content}
                                        onChange={(e) => setShareForm({ ...shareForm, content: e.target.value })}
                                        className="rounded-4 p-3 fs-14px"
                                        placeholder="Compose your message here..."
                                        fieldName="Email Message"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-top-0 p-4 pt-0">
                        <Button variant="flush-dark" onClick={() => setShowShareModal(false)} className="fw-bold me-auto">
                            Discard
                        </Button>
                        <Button
                            className="btn-gradient-primary px-4 py-2 rounded-pill d-flex align-items-center gap-2"
                            type="submit"
                            disabled={sendingEmail}
                        >
                            {sendingEmail ? (
                                <><Spinner size="sm" /> Sending...</>
                            ) : (
                                <><Envelope size={20} weight="bold" /> Send Email</>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            <style>{`
                .modal-90w {
                    max-width: 90vw !important;
                    width: 90vw !important;
                }
                
                /* PREVIEW CONTAINER: Dark Background for Contrast */
                #docx-preview-container {
                    background-color: #525659 !important; /* standard viewer gray */
                    color-scheme: light !important;
                    overflow: auto; /* Ensure scrolling works */
                }

                /* WRAPPER: Centers the pages */
                #docx-preview-container .docx-wrapper {
                    background: transparent !important; 
                    padding: 20px !important; /* Reduced padding from 40px to 20px */
                    display: flex !important;
                    flex-direction: column;
                    align-items: center !important;
                    width: auto !important; /* Let contents dictate width */
                    min-width: 100%;
                }

                /* PAGES: Crisp White Paper */
                #docx-preview-container section.docx, 
                #docx-preview-container article {
                    background: #ffffff !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
                    margin-bottom: 20px !important;
                    padding: 40px !important; /* Ensure internal padding */
                }

                /* TEXT RESET: Agresively force black text */
                #docx-preview-container *, 
                #docx-preview-container p, 
                #docx-preview-container span, 
                #docx-preview-container div,
                #docx-preview-container svg, 
                #docx-preview-container text {
                    color: #000000 !important;
                    fill: #000000 !important;
                    opacity: 1 !important; 
                    text-shadow: none !important;
                    -webkit-text-fill-color: #000000 !important;
                }
            `}</style>
            {/* Template Processing Modal */}
            <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)} size="xl" centered dialogClassName="modal-90w">
                <Modal.Header closeButton className="border-bottom py-3 px-4">
                    <Modal.Title className="h6 mb-0 fw-bold">Use Template: {selectedItem?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0" style={{ height: '85vh', backgroundColor: '#f8f9fa' }}>
                    <Row className="h-100 g-0">
                        {/* Left Side: Inputs (33%) */}
                        <Col md={4} className="h-100 border-end d-flex flex-column bg-white">
                            <div className="p-4 border-bottom bg-light">
                                <h6 className="fw-bold mb-3">1. Auto-Fill Details</h6>
                                <Form.Group>
                                    <Form.Label className="small text-muted text-uppercase fw-bold">Select Client / User</Form.Label>
                                    <Select
                                        options={allUsers.map(u => ({ label: u.full_name || u.email, value: u }))}
                                        onChange={(opt) => handleAutoFill(opt.value)}
                                        placeholder="Select a user to auto-populate..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </Form.Group>
                            </div>

                            <div className="p-4 flex-grow-1 overflow-auto">
                                <h6 className="fw-bold mb-3">2. Customize Content</h6>
                                {templateKeys.length === 0 ? (
                                    <p className="text-muted small">No variables detected in this template. You can still download it as-is.</p>
                                ) : (
                                    <Form>
                                        {templateKeys.map((key) => (
                                            <Form.Group key={key} className="mb-3">
                                                <Form.Label className="small fw-bold text-dark">{key.replace(/_/g, ' ').toUpperCase()}</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={templateData[key] || ''}
                                                    onChange={(e) => {
                                                        const newData = { ...templateData, [key]: e.target.value };
                                                        setTemplateData(newData);
                                                    }}
                                                    placeholder={`Enter ${key}...`}
                                                />
                                            </Form.Group>
                                        ))}
                                    </Form>
                                )}
                            </div>

                            <div className="p-4 border-top bg-light">
                                <Button variant="primary" className="w-100 btn-lg fw-bold" onClick={handleTemplateDownload}>
                                    <DownloadSimple size={20} className="me-2" weight="bold" /> Download Final Document
                                </Button>
                            </div>
                        </Col>

                        {/* Right Side: Realtime Preview (66%) */}
                        <Col md={8} className="h-100 position-relative p-0">
                            <div className="h-100 w-100 overflow-hidden d-flex flex-column">
                                {/* Container for docx-preview */}
                                <div
                                    id="docx-preview-container"
                                    ref={previewContainerRef}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        flex: 1,
                                        display: templatePreviewUrl ? 'block' : 'none',
                                    }}
                                />

                                {!templatePreviewUrl && (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100 bg-light">
                                        <Spinner animation="border" variant="primary" />
                                        <span className="mt-2 fw-bold text-muted">Generating fresh preview...</span>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div>
    );

    // --- Template Functions ---

    function handleUseTemplate() {
        if (!selectedItem?.file_path) {
            toast.error("No attachment found for this template.");
            return;
        }

        // Validate file type - MUST be .docx
        const getCleanExt = (path) => path ? path.split('?')[0].split('#')[0].toLowerCase().trim() : '';
        const isDocx = getCleanExt(selectedItem.file_path).endsWith('.docx') ||
            getCleanExt(selectedItem.name).endsWith('.docx');

        if (!isDocx) {
            toast.error("Smart Templates only work with Word (.docx) files. Please download the file or convert it.");
            return;
        }

        const toastId = toast.loading("Analyzing template...");

        // Fetch the blob
        // Check if file_path is already a full URL (which is how DocumentList saves it)
        const fileUrl = selectedItem.file_path.startsWith('http')
            ? selectedItem.file_path
            : supabase.storage.from('documents').getPublicUrl(selectedItem.file_path).data.publicUrl;

        fetch(fileUrl)
            .then(res => {
                if (!res.ok) throw new Error(`Network response was not ok: ${res.statusText}`);
                return res.blob();
            })
            .then(blob => {
                if (blob.size === 0) throw new Error("File is empty.");
                setTemplateBlob(blob);

                // Parse keys
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target.result;
                        const zip = new PizZip(content);

                        // We use Docxtemplater to get the text cleanly (handling XML tags inside keys)
                        const doc = new Docxtemplater(zip, {
                            paragraphLoop: true,
                            linebreaks: true,
                            nullGetter: () => "" // Replace undefined keys with empty string to keep preview clean
                        });

                        // Check valid structure by checking full text size or specific tags
                        // (Previously we checked document.xml existence, PizZip does that implicitly usually)

                        // Inspect the CLEAN text, not the XML. This handles cases like {<b/>date} -> {date}
                        const text = doc.getFullText();

                        // Regex to find {var}, {{var}}, <var>, <<var>>
                        // Matches: group 1 (start), group 2 (key), group 3 (end)
                        const regex = /(\{{1,2}|<{1,2})\s*([\w\-\s]+?)\s*(\}{1,2}|>{1,2})/g;
                        const foundKeys = new Set();
                        let match;
                        let detectedDelimiters = { start: '{', end: '}' }; // Default
                        let hasAngleBrackets = false;

                        while ((match = regex.exec(text)) !== null) {
                            const startTag = match[1];
                            const key = match[2].trim();

                            // Heuristic: If we start seeing < or <<, switch to angle brackets mode
                            if (startTag.includes('<')) {
                                hasAngleBrackets = true;
                                if (startTag === '<<') {
                                    detectedDelimiters = { start: '<<', end: '>>' };
                                } else {
                                    detectedDelimiters = { start: '<', end: '>' };
                                }
                            }

                            if (key && !key.startsWith('/')) foundKeys.add(key);
                        }

                        const keys = Array.from(foundKeys);
                        setTemplateKeys(keys);
                        setTemplateDelimiters(detectedDelimiters);
                        setTemplateData({}); // Reset data
                        setShowTemplateModal(true);

                        // Initial Preview - pass the detected delimiters
                        updateTemplatePreview({}, blob, detectedDelimiters);

                        toast.success(`Template ready! Found ${keys.length} variables.`, { id: toastId });
                    } catch (error) {
                        console.error('Template Parsing Error:', error);
                        if (error.message.includes("Corrupted zip")) {
                            toast.error("The document file appears to be corrupted.", { id: toastId });
                        } else if (error.message.includes("missing document.xml")) {
                            toast.error("This does not appear to be a defined Word document.", { id: toastId });
                        } else {
                            toast.error(`Error: ${error.message}`, { id: toastId });
                        }
                    }
                };
                reader.onerror = () => {
                    toast.error("Failed to read file data.", { id: toastId });
                };
                reader.readAsBinaryString(blob);
            })
            .catch(err => {
                console.error('Fetch Error:', err);
                toast.error(`Could not load template file: ${err.message}`, { id: toastId });
            });
    }

    // Updated for Mammoth Preview support
    function updateTemplatePreview(data, originalBlob = templateBlob, delimiters = templateDelimiters) {
        if (!originalBlob) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const zip = new PizZip(e.target.result);
                const doc = new Docxtemplater(zip, {
                    paragraphLoop: true,
                    linebreaks: true,
                    delimiters: delimiters, // Use detected delimiters
                    nullGetter: (part) => {
                        // If value is missing, show the placeholder (e.g., {name}) so user knows it's there
                        if (part.value) {
                            return `${delimiters.start}${part.value}${delimiters.end}`;
                        }
                        return "";
                    }
                });

                doc.render(data);

                const outWithData = doc.getZip().generate({
                    type: "arraybuffer", // docx-preview needs arraybuffer or blob
                    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                });

                // 1. Create Blob for Download
                const blob = new Blob([outWithData], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
                if (templatePreviewUrl) window.URL.revokeObjectURL(templatePreviewUrl);
                const newUrl = window.URL.createObjectURL(blob);
                setTemplatePreviewUrl(newUrl); // This URL is now for DOWNLOAD only

                // 2. Render High-Fidelity Preview with docx-preview
                if (previewContainerRef.current) {
                    renderAsync(outWithData, previewContainerRef.current, previewContainerRef.current, {
                        inWrapper: true, // Enable wrapper for better default styling (gray bg, centered pages)
                        ignoreWidth: false,
                        ignoreHeight: false,
                        ignoreFonts: false,
                        breakPages: true,
                        experimental: false // Disable experimental to ensure stability
                    })
                        .catch(err => console.error("docx-preview extraction failed", err));
                }


            } catch (error) {
                console.error("Preview generation failed", error);
            }
        };
        reader.readAsBinaryString(originalBlob);
    }

    function handleAutoFill(user) {
        if (!user) return;

        // Smart Mapping
        const newData = { ...templateData };
        templateKeys.forEach(key => {
            const k = key.toLowerCase();
            if (k.includes('name') && user.full_name) newData[key] = user.full_name;
            if (k.includes('email') && user.email) newData[key] = user.email;
            if (k.includes('phone')) newData[key] = "N/A"; // Placeholder logic
            if (k.includes('date')) newData[key] = new Date().toLocaleDateString();
        });

        setTemplateData(newData);
        updateTemplatePreview(newData);
        toast.success(`Fields auto-filled for ${user.full_name}`);
    }

    function handleTemplateDownload() {
        if (!templatePreviewUrl) return;

        fetch(templatePreviewUrl)
            .then(res => res.blob())
            .then(async blob => {
                saveAs(blob, `Filled_${selectedItem.name}`);
                toast.success("Document downloaded!");
                setShowTemplateModal(false);

                // Log template usage
                await useAuditLog.logAuditAction({
                    actionType: 'EXPORT', // Changed to match DB constraint
                    resourceType: AuditResourceType.DOCUMENT,
                    resourceId: selectedItem?.id,
                    resourceName: selectedItem?.name,
                    actionDescription: 'Generated and downloaded document from template',
                    metadata: { template_mode: 'smart_fill', action_detail: 'USE_TEMPLATE' },
                    actionStatus: AuditActionStatus.SUCCESS
                });
            });
    }
};

export default LibraryList;

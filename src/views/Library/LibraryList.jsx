import React, { useState, useEffect } from 'react';
import { Badge, Card, Col, Row, Button, Modal, Spinner, Offcanvas, Dropdown, Form, InputGroup } from 'react-bootstrap';
import {
    FileText, Envelope, Scroll, ListChecks, CheckSquare, Video,
    Eye, DownloadSimple, Briefcase, Users, CurrencyDollar, ShieldCheck,
    CaretRight, CaretDown, ShareNetwork, Plus, Copy, FilePdf, Paperclip, MagicWand, X, User, ArrowSquareOut, Star,
    ChatCircle, BookmarkSimple, Stack, NotePencil, ArrowsOutSimple
} from '@phosphor-icons/react';

import SimpleBar from 'simplebar-react';
import dayjs from 'dayjs';
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
                   POLISHED DRAWER DESIGN
                   ======================================== */
                .library-drawer {
                    width: 60% !important;
                    min-width: 450px;
                    max-width: 800px;
                    border: none !important;
                    border-radius: 20px 0 0 20px;
                    box-shadow: -8px 0 40px rgba(0,0,0,0.15);
                    background: #fff;
                    display: flex !important;
                    flex-direction: row !important;
                    overflow: hidden;
                }
                .library-drawer.offcanvas-end {
                    transform: translateX(100%);
                    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .library-drawer.show {
                    transform: translateX(0);
                }
                .library-drawer .offcanvas-body {
                    padding: 0 !important;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    overflow: hidden;
                }
                
                /* Left Icon Toolbar */
                .drawer-icon-toolbar {
                    width: 52px;
                    background: linear-gradient(180deg, #f8f9fa 0%, #f1f3f4 100%);
                    border-right: 1px solid #e8e8e8;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 10px 0;
                    gap: 6px;
                    flex-shrink: 0;
                }
                .toolbar-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #666;
                    transition: all 0.2s ease;
                    border: none;
                    background: transparent;
                }
                .toolbar-icon:hover {
                    background: #e8e8e8;
                    color: #333;
                    transform: scale(1.05);
                }
                .toolbar-icon.active {
                    background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
                    color: #F57C00;
                    box-shadow: 0 2px 8px rgba(245, 124, 0, 0.2);
                }
                .toolbar-icon.has-badge {
                    position: relative;
                }
                .toolbar-icon .badge-dot {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 8px;
                    height: 8px;
                    background: #ef4444;
                    border-radius: 50%;
                    border: 2px solid #f8f9fa;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                /* Main Content Area */
                .drawer-main-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    background: #fff;
                }
                
                /* Header */
                .drawer-header-modern {
                    padding: 10px 16px;
                    background: #fff;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .drawer-handle {
                    display: none;
                }
                .drawer-id-badge {
                    font-size: 11px;
                    font-weight: 700;
                    color: #666;
                    background: #f0f0f0;
                    padding: 5px 10px;
                    border-radius: 6px;
                    letter-spacing: 0.5px;
                }
                .drawer-header-title {
                    flex: 1;
                    font-size: 15px;
                    font-weight: 600;
                    color: #1a1a1a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .drawer-status-dropdown {
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #555;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }
                .drawer-status-dropdown:hover {
                    border-color: #1976D2;
                    color: #1976D2;
                }
                .drawer-close-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #f5f5f5;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #888;
                    transition: all 0.2s ease;
                }
                .drawer-close-btn:hover {
                    background: #ffebee;
                    color: #d32f2f;
                }
                
                /* Content Body */
                .drawer-body-modern {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0 !important;
                    background: #fafafa;
                }
                
                /* Document Info Section */
                .drawer-doc-section {
                    padding: 12px 16px;
                    background: #fff;
                    border-bottom: 1px solid #f0f0f0;
                }
                .drawer-doc-header {
                    display: flex;
                    gap: 14px;
                    margin-bottom: 14px;
                }
                .drawer-doc-thumb {
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e8e8e8 100%);
                    border-radius: 12px;
                    border: 1px solid #e0e0e0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    flex-shrink: 0;
                }
                .drawer-doc-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .drawer-category-badge {
                    font-size: 13px;
                    color: #555;
                    font-weight: 600;
                    line-height: 1.4;
                    letter-spacing: 0.3px;
                    padding: 7px 14px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
                    border-radius: 8px;
                    border: 1px solid #d0dae6;
                    width: fit-content;
                }
                .category-dot {
                    display: none;
                }
                .drawer-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0;
                    line-height: 1.35;
                }
                
                /* Metadata Grid */
                .drawer-metadata {
                    display: grid;
                    grid-template-columns: 70px 1fr;
                    gap: 6px 10px;
                    font-size: 13px;
                }
                .meta-label {
                    color: #888;
                    font-weight: 500;
                }
                .meta-value {
                    color: #333;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .drawer-type-tag {
                    display: inline-block;
                    padding: 4px 10px;
                    background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #1565C0;
                }
                .tag-chip {
                    display: inline-block;
                    padding: 4px 10px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #555;
                    background: #fff;
                }
                .tag-chip.urgent {
                    background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
                    border-color: #EF9A9A;
                    color: #C62828;
                }
                .tag-chip.special {
                    background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
                    border-color: #FFE082;
                    color: #F57C00;
                }
                .add-tag-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    border: 1px dashed #ccc;
                    border-radius: 6px;
                    font-size: 11px;
                    color: #888;
                    cursor: pointer;
                    background: transparent;
                    transition: all 0.2s ease;
                }
                .add-tag-btn:hover {
                    border-color: #1976D2;
                    color: #1976D2;
                }
                
                /* Section Headers */
                .drawer-section {
                    padding: 10px 16px 14px;
                    background: #fff;
                    margin-top: 0;
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .section-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .section-count {
                    font-weight: 500;
                    color: #888;
                }
                .section-link {
                    font-size: 12px;
                    font-weight: 600;
                    color: #1976D2;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }
                .section-link:hover {
                    color: #1565C0;
                    text-decoration: underline;
                }
                
                /* Content Preview */
                .content-preview-card {
                    background: #fff;
                    border-radius: 12px;
                    border: 1px solid #e8e8e8;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }
                .content-preview-header {
                    display: none;
                }
                .content-preview-body {
                    padding: 14px;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .preview-text {
                    font-size: 14px;
                    line-height: 1.7;
                    color: #444;
                }
                .preview-text h1, .preview-text h2, .preview-text h3 {
                    font-size: 15px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 14px 0 8px;
                }
                .preview-text p {
                    margin-bottom: 10px;
                }
                .preview-text ul, .preview-text ol {
                    padding-left: 20px;
                    margin-bottom: 10px;
                }
                .preview-text li {
                    margin-bottom: 4px;
                }
                .preview-loading {
                    padding: 32px;
                    text-align: center;
                    color: #888;
                    font-size: 13px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                
                /* File Attachments - Redesigned */
                .attachment-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 14px 18px;
                    background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    margin-top: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                }
                .attachment-card:hover {
                    background: #fff;
                    border-color: #007D88;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 125, 136, 0.08), 0 2px 4px rgba(0,0,0,0.02);
                }
                .attachment-icon {
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, rgba(0, 125, 136, 0.1) 0%, rgba(0, 125, 136, 0.05) 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #007D88;
                    transition: all 0.3s ease;
                }
                .attachment-card:hover .attachment-icon {
                    background: linear-gradient(135deg, rgba(0, 125, 136, 0.15) 0%, rgba(0, 125, 136, 0.1) 100%);
                    transform: scale(1.05);
                }
                .attachment-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .attachment-label {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1a1a1a;
                    display: block;
                }
                .attachment-size {
                    font-size: 12px;
                    color: #007D88;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .attachment-action {
                    display: flex;
                    align-items: center;
                    color: #94a3b8;
                }
                
                /* Footer */
                .drawer-footer-modern {
                    padding: 10px 16px;
                    background: #fff;
                    border-top: 1px solid #f0f0f0;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    box-shadow: 0 -4px 16px rgba(0,0,0,0.04);
                }
                .primary-action-btn {
                    width: 100%;
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #0D7377 0%, #14919B 100%);
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 700;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 12px rgba(13, 115, 119, 0.3);
                }
                .primary-action-btn:hover {
                    background: linear-gradient(135deg, #0A5C5F 0%, #0D7377 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(13, 115, 119, 0.4);
                }
                .secondary-actions-row {
                    display: flex;
                    gap: 10px;
                }
                .secondary-action-btn {
                    flex: 1;
                    padding: 12px 16px;
                    background: #f8f9fa;
                    border: 1px solid #e8e8e8;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #C62828;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }
                .secondary-action-btn svg {
                    color: #C62828;
                }
                .secondary-action-btn:hover {
                    background: #fff;
                    border-color: #C62828;
                    box-shadow: 0 2px 8px rgba(198, 40, 40, 0.1);
                }
                .secondary-action-dropdown {
                    flex: 1;
                }
                .secondary-action-dropdown .dropdown-toggle {
                    width: 100%;
                    padding: 12px 16px;
                    background: #f8f9fa;
                    border: 1px solid #e8e8e8;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #C62828;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }
                .secondary-action-dropdown .dropdown-toggle::after {
                    display: none;
                }
                .secondary-action-dropdown .dropdown-toggle:hover {
                    background: #fff;
                    border-color: #C62828;
                }
                .modern-dropdown-menu {
                    padding: 6px;
                    border-radius: 10px;
                    border: 1px solid #e8e8e8;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
                }
                .modern-dropdown-menu .dropdown-item {
                    padding: 10px 14px;
                    font-size: 13px;
                    font-weight: 500;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .modern-dropdown-menu .dropdown-item:hover {
                    background: #f5f5f5;
                }
                
                /* Hide unused elements */
                .drawer-stats-row, .stat-item, .stat-divider {
                    display: none;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .library-drawer {
                        width: 100% !important;
                        min-width: auto;
                        max-width: 100%;
                        border-radius: 20px 20px 0 0;
                    }
                    .drawer-icon-toolbar {
                        width: 48px;
                        padding: 12px 0;
                    }
                    .toolbar-icon {
                        width: 34px;
                        height: 34px;
                    }
                    .drawer-header-modern {
                        padding: 14px 16px;
                    }
                    .drawer-doc-section {
                        padding: 16px;
                    }
                    .drawer-section {
                        padding: 16px;
                    }
                    .drawer-footer-modern {
                        padding: 14px 16px;
                    }
                }
                
                /* Redesigned Preview Modal */
                .preview-modal-modern .modal-content {
                    border-radius: 16px !important;
                    border: none !important;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.15);
                }
                .preview-modal-header {
                    padding: 16px 24px !important;
                    background: #fff;
                    border-bottom: 1px solid #f0f0f0 !important;
                }
                .btn-preview-open {
                    background: #fff !important;
                    border: 1px solid #e5e7eb !important;
                    color: #1a1a1a !important;
                    font-weight: 600 !important;
                    padding: 8px 16px !important;
                    border-radius: 8px !important;
                    transition: all 0.2s ease;
                }
                .btn-preview-open:hover {
                    background: #f9fafb !important;
                    border-color: #d1d5db !important;
                }
                .btn-preview-download {
                    background: #007D88 !important;
                    border: none !important;
                    color: #fff !important;
                    font-weight: 600 !important;
                    padding: 8px 16px !important;
                    border-radius: 8px !important;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(13, 115, 119, 0.2);
                }
                .btn-preview-download:hover {
                    background: #0A5C5F !important;
                    box-shadow: 0 4px 8px rgba(13, 115, 119, 0.3);
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

            {/* Preview Drawer - New Design */}
            <Offcanvas
                show={showPreview}
                onHide={() => setShowPreview(false)}
                placement="end"
                className="library-drawer"
                backdrop={true}
            >
                {/* Main Content */}
                <div className="drawer-main-content">
                    {/* Header */}
                    <div className="drawer-header-modern">
                        <div className="drawer-category-badge">
                            {getCategoryPath(selectedItem?.category_id).join(' › ') || 'Library'}
                        </div>
                        <button
                            className="drawer-close-btn"
                            onClick={() => setShowPreview(false)}
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content Body */}
                    <Offcanvas.Body className="drawer-body-modern">
                        {/* Document Info Section */}
                        <div className="drawer-doc-section">
                            <div className="drawer-doc-header">
                                <div className="drawer-doc-thumb">
                                    <FileText size={32} weight="thin" />
                                </div>
                                <div className="drawer-doc-info">
                                    <h2 className="drawer-title">{selectedItem?.name}</h2>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="drawer-metadata">
                                <span className="meta-label">Doc ID</span>
                                <span className="meta-value">
                                    DOC-{selectedItem?.id?.slice(-5)?.toUpperCase() || '00000'}
                                </span>

                                <span className="meta-label">Created</span>
                                <span className="meta-value">
                                    {selectedItem?.created_at ? dayjs(selectedItem.created_at).format('DD-MM-YYYY') : '—'}
                                </span>

                                <span className="meta-label">Modified</span>
                                <span className="meta-value">
                                    {selectedItem?.updated_at ? dayjs(selectedItem.updated_at).format('DD-MM-YYYY') : '—'}
                                </span>
                            </div>
                        </div>

                        {/* Content Preview Section */}
                        <div className="drawer-section">
                            <div className="section-header">
                                <span className="section-title">
                                    Preview
                                </span>
                                <span className="section-link">Full View</span>
                            </div>
                            <div className="content-preview-card">
                                <div className="content-preview-body">
                                    {selectedItem?.content ? (
                                        <div
                                            className="preview-text"
                                            dangerouslySetInnerHTML={{ __html: selectedItem?.content }}
                                        />
                                    ) : (
                                        <div className="preview-loading">
                                            <Spinner animation="border" variant="primary" size="sm" />
                                            <span>Loading...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Attachments */}
                            {selectedItem?.file_path && (
                                <div className="attachment-card" onClick={() => handleFilePreview(selectedItem.file_path, selectedItem.name)}>
                                    <div className="attachment-icon">
                                        <Paperclip size={20} weight="bold" />
                                    </div>
                                    <div className="attachment-text">
                                        <span className="attachment-label">Original Document</span>
                                        <div className="attachment-size">
                                            <span>View file</span>
                                            <CaretRight size={12} weight="bold" />
                                        </div>
                                    </div>
                                    <div className="attachment-action">
                                        <ArrowSquareOut size={18} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Offcanvas.Body>

                    {/* Footer */}
                    <div className="drawer-footer-modern">
                        {/* Primary Action */}
                        <button
                            className="primary-action-btn"
                            onClick={() => handleUseTemplate()}
                        >
                            <MagicWand size={18} weight="bold" />
                            <span>Use This Template</span>
                        </button>

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
                </div>
            </Offcanvas>

            {/* Document Preview Modal */}

            <Modal show={showFilePreview} onHide={() => setShowFilePreview(false)} size="xl" centered style={{ zIndex: 1060 }} className="preview-modal-modern">
                <Modal.Header closeButton className="preview-modal-header">
                    <div className="d-flex align-items-center justify-content-between w-100 me-4">
                        <Modal.Title className="h6 mb-0 fw-bold text-truncate" style={{ maxWidth: '60%' }}>
                            Preview: {previewDocName}
                        </Modal.Title>
                        <div className="d-flex gap-2">
                            <Button
                                variant="light"
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-preview-open d-flex align-items-center gap-2"
                            >
                                <ArrowSquareOut size={16} weight="bold" color="#ef4444" />
                                <span className="d-none d-sm-inline">Open New Tab</span>
                            </Button>
                            <Button
                                variant="primary"
                                href={previewUrl}
                                download
                                className="btn-preview-download d-flex align-items-center gap-2"
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
            if (k.includes('date')) newData[key] = dayjs().format('DD-MM-YYYY');
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

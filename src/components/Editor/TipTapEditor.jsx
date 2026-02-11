import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from 'react-bootstrap';
import { MagicWand, TextAa, ListBullets, TextB, TextItalic } from '@phosphor-icons/react';
import styled from 'styled-components';

const StyledEditorContainer = styled.div`
    .ProseMirror {
        outline: none;
        min-height: 300px;
        padding: 1rem;
    }
    .ProseMirror p.is-editor-empty:first-child::before {
        color: #adb5bd;
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
    }
`;

const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <Button
        variant={isActive ? "secondary" : "light"}
        size="sm"
        className="d-flex align-items-center justify-content-center p-2"
        onClick={onClick}
        title={title}
        style={{ width: '32px', height: '32px' }}
    >
        {children}
    </Button>
);

import { marked } from 'marked';
import { sanitizeHTML } from '../../lib/sanitize';

const TipTapEditor = ({ content, onChange }) => {
    // Parse content if it's markdown string to ensure TipTap renders it
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Type '/' for commands or start writing...",
            }),
        ],
        content: content ? marked.parse(content) : '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-3',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(sanitizeHTML(editor.getHTML()));
        },
    });

    // Update editor content when prop changes (if needed, e.g., after AI generation)
    React.useEffect(() => {
        if (editor && content) {
            // Only update if content is drastically different to avoid cursor jumps
            if (editor.getText() === '' && content) {
                editor.commands.setContent(marked.parse(content));
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    const setParagraph = () => editor.chain().focus().setParagraph().run();
    const toggleBold = () => editor.chain().focus().toggleBold().run();
    const toggleItalic = () => editor.chain().focus().toggleItalic().run();
    const toggleList = () => editor.chain().focus().toggleBulletList().run();

    return (
        <StyledEditorContainer className="editor-container border rounded bg-white">
            <div className="d-flex gap-2 p-2 border-bottom bg-light rounded-top align-items-center">
                <ToolbarButton onClick={toggleBold} isActive={editor.isActive('bold')} title="Bold">
                    <TextB size={16} weight="bold" />
                </ToolbarButton>
                <ToolbarButton onClick={toggleItalic} isActive={editor.isActive('italic')} title="Italic">
                    <TextItalic size={16} />
                </ToolbarButton>
                <div className="vr mx-1"></div>
                <ToolbarButton onClick={setParagraph} isActive={editor.isActive('paragraph')} title="Text">
                    <TextAa size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={toggleList} isActive={editor.isActive('bulletList')} title="List">
                    <ListBullets size={16} />
                </ToolbarButton>
                <div className="vr mx-1"></div>
                <Button variant="link" size="sm" className="d-flex align-items-center gap-2 text-decoration-none px-2 text-primary fw-bold ms-auto">
                    <MagicWand size={16} /> AI Write
                </Button>
            </div>

            <EditorContent editor={editor} />
        </StyledEditorContainer>
    );
};

export default TipTapEditor;

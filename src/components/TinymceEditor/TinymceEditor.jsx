import { Editor } from '@tinymce/tinymce-react';
import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../utils/theme-provider/theme-provider';
import AITextEnhancer from '../AIEnhancer/AITextEnhancer';


const TinymceEditor = ({ initialvalue, value, onChange }) => {

    const editorRef = useRef(null);
    const { theme } = useTheme();
    const [currentValue, setCurrentValue] = useState(value || initialvalue || "");

    useEffect(() => {
        if (value !== undefined) setCurrentValue(value);
    }, [value]);

    const handleEditorChange = (content) => {
        setCurrentValue(content);
        if (onChange) onChange(content);
    };

    const handleAIUpdate = (newContent) => {
        setCurrentValue(newContent);
        if (editorRef.current) {
            editorRef.current.setContent(newContent);
        }
        if (onChange) onChange(newContent);
    };

    // This key forces full remount when theme changes
    const editorKey = `${theme}`;

    return (
        <AITextEnhancer
            value={currentValue}
            onUpdate={handleAIUpdate}
            fieldName="Rich Text Editor"
            noInputGroup={true}
        >
            <Editor
                key={editorKey}
                onEditorChange={handleEditorChange}
                value={currentValue}
                apiKey="59tfa9du2nj9f2vknfej0bmxhctmfjh34keva1mouvizl8af"
                onInit={(evt, editor) => (editorRef.current = editor)}
                init={{
                    height: 500,
                    // ... rest of init config remains largely same but updated for stability
                    menubar: "file edit view insert format tools table tc help",
                    toolbar: "undo redo | bold italic underline strikethrough backcolor | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                    skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
                    content_css: theme === 'dark' ? 'tinymce-5-dark' : 'tinymce-5',
                    content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    toolbar_mode: "sliding",
                }}
            />
        </AITextEnhancer>
    );
};

export default TinymceEditor;

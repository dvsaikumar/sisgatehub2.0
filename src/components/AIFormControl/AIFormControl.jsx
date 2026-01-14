import React from 'react';
import { Form } from 'react-bootstrap';
import AITextEnhancer from '../AIEnhancer/AITextEnhancer';

const AIFormControl = React.forwardRef(({ aiEnhance = true, fieldName, ...props }, ref) => {
    // Only enhance text-like fields
    const shouldEnhance = aiEnhance &&
        (!props.type || props.type === 'text' || props.type === 'textarea' || props.as === 'textarea');

    if (shouldEnhance) {
        return (
            <AITextEnhancer
                value={props.value || ''}
                onUpdate={(val) => {
                    if (props.onChange) {
                        props.onChange({ target: { value: val, name: props.name } });
                    }
                }}
                fieldName={fieldName || props.placeholder || "Field"}
                noInputGroup={props.noInputGroup}
            >
                <Form.Control
                    ref={ref}
                    {...props}
                />
            </AITextEnhancer>
        );
    }

    return <Form.Control ref={ref} {...props} />;
});

AIFormControl.displayName = 'AIFormControl';

export default AIFormControl;

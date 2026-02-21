import React from 'react';
import { Form, Badge } from 'react-bootstrap';
import { Bell } from '@phosphor-icons/react';

/**
 * ReminderSelector Component
 * Multi-select for pre-event reminder times.
 * Stores values as integer[] (minutes before event).
 */

const REMINDER_OPTIONS = [
    { label: 'At time of event', value: 0 },
    { label: '5 minutes before', value: 5 },
    { label: '15 minutes before', value: 15 },
    { label: '30 minutes before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '2 hours before', value: 120 },
    { label: '1 day before', value: 1440 },
    { label: '1 week before', value: 10080 },
];

const ReminderSelector = ({ value = [], onChange }) => {
    const selectedValues = Array.isArray(value) ? value : [];

    const toggleReminder = (minutes) => {
        const newValues = selectedValues.includes(minutes)
            ? selectedValues.filter(v => v !== minutes)
            : [...selectedValues, minutes].sort((a, b) => a - b);
        onChange?.(newValues);
    };

    const getLabel = (minutes) => {
        const opt = REMINDER_OPTIONS.find(o => o.value === minutes);
        return opt?.label || `${minutes} min`;
    };

    return (
        <div className="reminder-selector">
            <Form.Label className="d-flex align-items-center gap-2 mb-2">
                <Bell size={16} weight="bold" />
                <span>Reminders</span>
            </Form.Label>

            {/* Selected reminders as badges */}
            {selectedValues.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mb-2">
                    {selectedValues.map(v => (
                        <Badge
                            key={v}
                            bg="light"
                            text="dark"
                            className="d-flex align-items-center gap-1 px-2 py-1 border rounded-pill"
                            style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                            onClick={() => toggleReminder(v)}
                        >
                            <Bell size={12} weight="fill" className="text-primary" />
                            {getLabel(v)}
                            <span className="ms-1 text-muted">×</span>
                        </Badge>
                    ))}
                </div>
            )}

            <Form.Select
                size="sm"
                value=""
                onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) toggleReminder(val);
                }}
                style={{ maxWidth: 250 }}
            >
                <option value="">Add a reminder...</option>
                {REMINDER_OPTIONS.filter(o => !selectedValues.includes(o.value)).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </Form.Select>
        </div>
    );
};

export default ReminderSelector;

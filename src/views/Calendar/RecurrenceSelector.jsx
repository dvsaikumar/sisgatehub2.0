import React, { useState, useEffect } from 'react';
import { Form, Row, Col, ButtonGroup, Button } from 'react-bootstrap';
import { Repeat, CalendarBlank } from '@phosphor-icons/react';
import dayjs from '../../lib/dayjs';

/**
 * Recurrence Selector Component
 * Allows users to set up recurring event patterns.
 * Generates RFC 5545 RRULE strings.
 */

const PRESETS = [
    { label: 'None', value: 'none' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Custom', value: 'custom' },
];

const WEEKDAYS = [
    { label: 'Mon', value: 'MO' },
    { label: 'Tue', value: 'TU' },
    { label: 'Wed', value: 'WE' },
    { label: 'Thu', value: 'TH' },
    { label: 'Fri', value: 'FR' },
    { label: 'Sat', value: 'SA' },
    { label: 'Sun', value: 'SU' },
];

const RecurrenceSelector = ({ value, onChange, eventDate }) => {
    const [preset, setPreset] = useState('none');
    const [interval, setInterval] = useState(1);
    const [selectedDays, setSelectedDays] = useState(['MO']);
    const [endType, setEndType] = useState('never'); // 'never', 'date', 'count'
    const [endDate, setEndDate] = useState('');
    const [endCount, setEndCount] = useState(10);
    const [customFreq, setCustomFreq] = useState('WEEKLY');

    // Parse incoming value on mount
    useEffect(() => {
        if (!value) {
            setPreset('none');
            return;
        }
        // Simple parse to set UI state from RRULE
        if (value.includes('FREQ=DAILY') && !value.includes('INTERVAL=')) setPreset('daily');
        else if (value.includes('FREQ=WEEKLY') && !value.includes('INTERVAL=')) setPreset('weekly');
        else if (value.includes('FREQ=MONTHLY') && !value.includes('INTERVAL=')) setPreset('monthly');
        else if (value.includes('FREQ=YEARLY') && !value.includes('INTERVAL=')) setPreset('yearly');
        else if (value) setPreset('custom');
    }, []);

    // Build RRULE string from state
    const buildRRule = (p, freq, int, days, eType, eDate, eCount) => {
        if (p === 'none') return null;

        let rule = '';

        if (p === 'daily') rule = 'FREQ=DAILY';
        else if (p === 'weekly') rule = 'FREQ=WEEKLY';
        else if (p === 'monthly') rule = 'FREQ=MONTHLY';
        else if (p === 'yearly') rule = 'FREQ=YEARLY';
        else {
            // Custom
            rule = `FREQ=${freq}`;
            if (int > 1) rule += `;INTERVAL=${int}`;
            if (freq === 'WEEKLY' && days.length > 0) {
                rule += `;BYDAY=${days.join(',')}`;
            }
        }

        if (eType === 'date' && eDate) {
            rule += `;UNTIL=${dayjs(eDate).format('YYYYMMDDTHHmmss')}Z`;
        } else if (eType === 'count' && eCount > 0) {
            rule += `;COUNT=${eCount}`;
        }

        return rule;
    };

    const handlePresetChange = (newPreset) => {
        setPreset(newPreset);
        const rule = buildRRule(newPreset, customFreq, interval, selectedDays, endType, endDate, endCount);
        onChange?.(rule);
    };

    const handleCustomChange = (updates = {}) => {
        const f = updates.freq ?? customFreq;
        const i = updates.interval ?? interval;
        const d = updates.days ?? selectedDays;
        const et = updates.endType ?? endType;
        const ed = updates.endDate ?? endDate;
        const ec = updates.endCount ?? endCount;

        if (updates.freq !== undefined) setCustomFreq(f);
        if (updates.interval !== undefined) setInterval(i);
        if (updates.days !== undefined) setSelectedDays(d);
        if (updates.endType !== undefined) setEndType(et);
        if (updates.endDate !== undefined) setEndDate(ed);
        if (updates.endCount !== undefined) setEndCount(ec);

        const rule = buildRRule('custom', f, i, d, et, ed, ec);
        onChange?.(rule);
    };

    const toggleDay = (day) => {
        const newDays = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day];
        handleCustomChange({ days: newDays });
    };

    // Get human-readable label
    const getReadableLabel = () => {
        if (preset === 'none') return null;
        if (preset === 'daily') return 'Repeats daily';
        if (preset === 'weekly') return `Repeats weekly on ${dayjs(eventDate).format('dddd')}`;
        if (preset === 'monthly') return `Repeats monthly on day ${dayjs(eventDate).format('D')}`;
        if (preset === 'yearly') return `Repeats yearly on ${dayjs(eventDate).format('MMMM D')}`;
        return 'Custom recurrence';
    };

    return (
        <div className="recurrence-selector">
            <Form.Label className="d-flex align-items-center gap-2 mb-2">
                <Repeat size={16} weight="bold" />
                <span>Repeat</span>
            </Form.Label>

            {/* Preset buttons */}
            <div className="d-flex flex-wrap gap-2 mb-2">
                {PRESETS.map(p => (
                    <Button
                        key={p.value}
                        size="sm"
                        variant={preset === p.value ? 'primary' : 'outline-secondary'}
                        onClick={() => handlePresetChange(p.value)}
                        className="rounded-pill px-3"
                        style={{ fontSize: '0.8rem' }}
                    >
                        {p.label}
                    </Button>
                ))}
            </div>

            {/* Custom options */}
            {preset === 'custom' && (
                <div className="p-3 border rounded-3 bg-light mt-2" style={{ fontSize: '0.875rem' }}>
                    <Row className="gx-2 mb-2 align-items-center">
                        <Col xs="auto">
                            <span className="text-muted">Every</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                min={1}
                                max={99}
                                value={interval}
                                onChange={e => handleCustomChange({ interval: parseInt(e.target.value) || 1 })}
                                size="sm"
                            />
                        </Col>
                        <Col>
                            <Form.Select
                                size="sm"
                                value={customFreq}
                                onChange={e => handleCustomChange({ freq: e.target.value })}
                            >
                                <option value="DAILY">day(s)</option>
                                <option value="WEEKLY">week(s)</option>
                                <option value="MONTHLY">month(s)</option>
                                <option value="YEARLY">year(s)</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    {/* Day picker for weekly */}
                    {customFreq === 'WEEKLY' && (
                        <div className="mb-2">
                            <small className="text-muted d-block mb-1">On these days:</small>
                            <ButtonGroup size="sm">
                                {WEEKDAYS.map(d => (
                                    <Button
                                        key={d.value}
                                        variant={selectedDays.includes(d.value) ? 'primary' : 'outline-secondary'}
                                        onClick={() => toggleDay(d.value)}
                                        style={{ minWidth: 40, fontSize: '0.75rem' }}
                                    >
                                        {d.label}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </div>
                    )}

                    {/* End condition */}
                    <div className="mt-2">
                        <small className="text-muted d-block mb-1">Ends:</small>
                        <div className="d-flex flex-column gap-2">
                            <Form.Check
                                type="radio"
                                label="Never"
                                name="recurrence-end"
                                checked={endType === 'never'}
                                onChange={() => handleCustomChange({ endType: 'never' })}
                            />
                            <div className="d-flex align-items-center gap-2">
                                <Form.Check
                                    type="radio"
                                    label="On date"
                                    name="recurrence-end"
                                    checked={endType === 'date'}
                                    onChange={() => handleCustomChange({ endType: 'date' })}
                                />
                                {endType === 'date' && (
                                    <Form.Control
                                        type="date"
                                        size="sm"
                                        value={endDate}
                                        onChange={e => handleCustomChange({ endDate: e.target.value })}
                                        style={{ width: 160 }}
                                    />
                                )}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <Form.Check
                                    type="radio"
                                    label="After"
                                    name="recurrence-end"
                                    checked={endType === 'count'}
                                    onChange={() => handleCustomChange({ endType: 'count' })}
                                />
                                {endType === 'count' && (
                                    <>
                                        <Form.Control
                                            type="number"
                                            size="sm"
                                            min={1}
                                            max={999}
                                            value={endCount}
                                            onChange={e => handleCustomChange({ endCount: parseInt(e.target.value) || 1 })}
                                            style={{ width: 70 }}
                                        />
                                        <span className="text-muted small">occurrences</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview text */}
            {preset !== 'none' && (
                <div className="mt-2 d-flex align-items-center gap-1">
                    <CalendarBlank size={14} className="text-primary" />
                    <small className="text-primary fw-medium">{getReadableLabel()}</small>
                </div>
            )}
        </div>
    );
};

export default RecurrenceSelector;

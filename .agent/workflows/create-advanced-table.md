---
description: How to create a new Advanced Table with the Sisgate PRO default design
---

To create a new table following the standardized "Advanced Table" design, follow these steps:

### 1. Component Structure
Wrap your table in a `Card` with the `.card-border` class and use the `.table-advance-container` utility to prevent dropdown clipping.

```jsx
import { Card, Table, Dropdown, Button } from 'react-bootstrap';
import { DotsThreeVertical } from '@phosphor-icons/react';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';

const MyTable = () => {
    return (
        <Card className="card-border">
            <Card.Body className="p-0">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3 p-3">
                    <h5 className="mb-0">Table Title</h5>
                    <Button className="btn-gradient-primary">Add New</Button>
                </div>
                
                {/* Table Container (Vital for dropdowns) */}
                <div className="table-advance-container">
                    <Table responsive borderless className="nowrap table-advance">
                        <thead>
                            <tr>
                                <th>Column 1</th>
                                <th>Column 2</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Data 1</td>
                                <td>Data 2</td>
                                <td>
                                    <div className="d-flex align-items-center justify-content-end">
                                        <Dropdown className="dropdown-inline" align="end">
                                            <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret">
                                                <HkTooltip placement="top" title="More" trigger="hover">
                                                    <span className="icon">
                                                        <DotsThreeVertical size={20} weight="bold" />
                                                    </span>
                                                </HkTooltip>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu 
                                                popperConfig={{ 
                                                    modifiers: [
                                                        { name: 'flip', options: { boundary: 'viewport' } },
                                                        { name: 'preventOverflow', options: { boundary: 'viewport' } }
                                                    ] 
                                                }}
                                            >
                                                <Dropdown.Item>Action 1</Dropdown.Item>
                                                <Dropdown.Item className="text-danger">Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </td>
                            </tr>
                            {/* Visual Gap Row */}
                            <tr className="table-row-gap"><td colSpan="3" /></tr>
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
};
```

### 2. Key Design Rules
1.  **Container**: Always use `<div className="table-advance-container">` around your `<Table>`. This has `overflow: visible` to ensure dropdowns aren't clipped.
2.  **Table Classes**: Use `borderless`, `nowrap`, and `table-advance` on the `Table` component.
3.  **Dropdown Tooltips**: Place the `HkTooltip` **inside** the `Dropdown.Toggle` to preserve the Popper ref anchor.
4.  **Popper Config**: Always use `boundary: 'viewport'` in the `popperConfig` modifiers to ensure proper alignment relative to the screen.
5.  **Gap Rows**: Use `<tr className="table-row-gap">` between data rows to maintain the "card-per-row" aesthetic.

### 3. Global Styles
The following styles are already included in `src/styles/scss/style.scss` and should not be redefined:
- `.table-advance`: Handles the custom row borders and hover effects.
- `.table-advance-container`: Ensures dropdown visibility.
- `.table-row-gap`: Creates the spacing between rows.
- Dropdown z-index is set to `1100` within the advance container.

export const libraryData = [
    {
        id: 1,
        title: "Shareholder Agreement",
        type: "document",
        category: "Corporate",
        description: "Standard agreement for company shareholders defining rights and obligations.",
        lastUpdated: "2 days ago",
        starred: true,
    },
    {
        id: 2,
        title: "Employment Contract",
        type: "document",
        category: "HR",
        description: "Full-time employment agreement template with standard clauses.",
        lastUpdated: "1 week ago",
        starred: false,
    },
    {
        id: 3,
        title: "Debt Collection Letter 1",
        type: "letter",
        category: "Finance",
        description: "First formal notice for overdue payment.",
        lastUpdated: "3 weeks ago",
        starred: false,
    },
    {
        id: 4,
        title: "Redundancy Notice",
        type: "letter",
        category: "HR",
        description: "Formal notification letter for position redundancy.",
        lastUpdated: "1 month ago",
        starred: true,
    },
    {
        id: 5,
        title: "Privacy Policy (GDPR)",
        type: "document",
        category: "Compliance",
        description: "GDPR-compliant privacy policy suitable for most websites.",
        lastUpdated: "5 days ago",
        starred: false,
    },
    {
        id: 6,
        title: "NDA (Non-Disclosure Agreement)",
        type: "document",
        category: "Corporate",
        description: "Mutual non-disclosure agreement for business discussions.",
        lastUpdated: "2 months ago",
        starred: true,
    }
];

export const columns = [
    {
        accessor: "title",
        Header: "Title",
    },
    {
        accessor: "type",
        Header: "Type",
    },
    {
        accessor: "category",
        Header: "Category",
    },
    {
        accessor: "lastUpdated",
        Header: "Last Updated",
    },
];

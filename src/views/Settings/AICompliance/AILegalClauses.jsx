import React from 'react';
import EditableCompliancePage from '../../../components/EditableCompliancePage/EditableCompliancePage';

const AILegalClauses = () => {
    const defaultTitle = "Legal Hardening Clauses";
    const defaultHtmlContent = `
        <div class="mb-4">
            <p class="text-muted">Recommended clauses for Terms of Service (ToS) and Master Services Agreements (MSA).</p>
        </div>

        <div class="policy-section mb-4">
            <h4>1. Liability & Disclaimer Clause</h4>
            <div class="bg-light p-3 rounded border">
                <p><strong>Use of AI Technology:</strong></p>
                <p>
                    Client acknowledges that Provider uses Artificial Intelligence ("AI") tools to assist in the delivery of Services. While Provider uses commercially reasonable efforts to verify AI-generated outputs, Client accepts that AI technologies may produce errors, hallucinations, or inaccuracies.
                </p>
                <p>
                    Provider shall remain responsible for the final deliverables provided to Client; however, Client agrees that Provider shall not be liable for minor non-conformities or errors inherent in AI generation that do not materially affect the utility of the Service. Client is responsible for the final verification of any AI-generated content used for legal, medical, or financial decision-making.
                </p>
            </div>
        </div>

        <div class="policy-section mb-4">
            <h4>2. Intellectual Property (IP) Clause</h4>
            <div class="bg-light p-3 rounded border">
                <p><strong>Ownership of AI-Generated Content:</strong></p>
                <p>
                    To the extent permitted by applicable law, Provider assigns to Client all right, title, and interest in and to the final deliverables produced for Client, including those generated with AI assistance.
                </p>
                <p>
                    Client acknowledges that raw AI-generated outputs typically cannot be copyrighted. Provider makes no warranty that AI-generated components of the deliverables will be capable of exclusive copyright protection in all jurisdictions.
                </p>
            </div>
        </div>
    `;

    return (
                <EditableCompliancePage
            pageKey="ai_legal"
            defaultTitle={defaultTitle}
            defaultHtmlContent={defaultHtmlContent}
        />
            );
};

export default AILegalClauses;

import React from 'react';
import EditableCompliancePage from '../../../components/EditableCompliancePage/EditableCompliancePage';

const AIDataHandling = () => {
    const defaultTitle = "Confidentiality & Data Handling Rules for AI";
    const defaultHtmlContent = `
        <div class="mb-4">
            <p class="text-muted">Directives on data input classification for AI systems.</p>
        </div>

        <div class="policy-section mb-4">
            <h4>Data Classification Matrix</h4>
            <div class="table-responsive mt-3">
                <table class="table table-bordered table-hover">
                    <thead class="bg-light">
                        <tr>
                            <th style="width: 20%;">Data Type</th>
                            <th style="width: 40%;">Examples</th>
                            <th style="width: 40%;">AI Usage Rule</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Public Data</strong></td>
                            <td>Marketing copy, published blog posts, public press releases.</td>
                            <td class="text-success"><strong>ALLOWED</strong> in all tools.</td>
                        </tr>
                        <tr>
                            <td><strong>Internal Business Data</strong></td>
                            <td>Meeting notes, internal memos, project plans (non-sensitive).</td>
                            <td class="text-warning"><strong>CAUTION:</strong> Use only in Enterprise/Paid versions. Do not use in public free training models.</td>
                        </tr>
                        <tr>
                            <td><strong>Confidential / IP</strong></td>
                            <td>Source code, trade secrets, financial reports, strategic roadmaps.</td>
                            <td class="text-danger"><strong>PROHIBITED</strong> unless using a private, self-hosted, or zero-retention AI instance approved by IT.</td>
                        </tr>
                        <tr>
                            <td><strong>Personal Data (PII)</strong></td>
                            <td>Customer names, addresses, employee records, emails.</td>
                            <td class="text-danger"><strong>STRICTLY PROHIBITED</strong>. Anonymize data before inputting into any AI tool.</td>
                        </tr>
                        <tr>
                            <td><strong>Sensitive Categories (GDPR Art. 9)</strong></td>
                            <td>Health data, political opinions, biometric data.</td>
                            <td class="text-danger"><strong>NEVER ALLOWED.</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="policy-section mb-4">
            <h4>Anonymization Techniques</h4>
            <p>Before using AI for tasks involving client data, you must:</p>
            <ul>
                <li>Replace names with generic placeholders (e.g., "Client A", "User 123").</li>
                <li>Redact specific dates, locations, or monetary figures if they identify a specific person or transaction.</li>
                <li>Remove email addresses and phone numbers.</li>
            </ul>
        </div>
    `;

    return (
                <EditableCompliancePage
            pageKey="ai_data_handling"
            defaultTitle={defaultTitle}
            defaultHtmlContent={defaultHtmlContent}
        />
            );
};

export default AIDataHandling;

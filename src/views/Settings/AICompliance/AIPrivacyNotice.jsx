import React from 'react';
import EditableCompliancePage from '../../../components/EditableCompliancePage/EditableCompliancePage';

const AIPrivacyNotice = () => {
    const defaultTitle = "GDPR & AI Privacy Notice";
    const defaultHtmlContent = `
        <div class="mb-4">
            <p class="text-muted">Draft clause to be added to your main Privacy Policy.</p>
        </div>

        <div class="alert alert-info mb-4">
            <i class="bi bi-info-circle-fill me-2"></i>
            <strong>Implementation Note:</strong> This text should be integrated into your public-facing Privacy Policy if you use AI to process personal data.
        </div>

        <div class="policy-section mb-4">
            <h4>Automated Decision-Making and Profiling</h4>
            <p>
                We use Artificial Intelligence (AI) and machine learning technologies to enhance our services. Specifically, we use AI for:
                <ul>
                    <li>Content generation and summarization assistance.</li>
                    <li>Data categorization and search optimization.</li>
                    <li>[Add other specific uses here]</li>
                </ul>
            </p>
            <p>
                <strong>Human Involvement:</strong> Our AI systems are designed as decision-support tools. No significant legal effects or decisions concerning you (such as loan approval, hiring, or account termination) are made solely by automated means without human intervention. All AI-generated outputs are reviewed by our staff where they impact service delivery.
            </p>
        </div>

        <div class="policy-section mb-4">
            <h4>Data Processing for AI Improvement</h4>
            <p>
                We [DO / DO NOT] use your data to train or improve our AI models.
                <br />
                <em>(If you use enterprise API with zero-retention, state: "Your data is not used to train third-party AI models.")</em>
            </p>
        </div>

        <div class="policy-section mb-4">
            <h4>Third-Party AI Processors</h4>
            <p>
                We engage the following third-party AI providers to process data:
                <ul>
                    <li><strong>OpenAI:</strong> For natural language processing [Location: US/EU]</li>
                    <li><strong>[Other Vendor]:</strong> [Purpose]</li>
                </ul>
                Appropriate safeguards, such as Standard Contractual Clauses (SCCs) or Data Privacy Framework adequacy decisions, are in place for international transfers.
            </p>
        </div>
    `;

    return (
                <EditableCompliancePage
            pageKey="ai_privacy"
            defaultTitle={defaultTitle}
            defaultHtmlContent={defaultHtmlContent}
        />
            );
};

export default AIPrivacyNotice;

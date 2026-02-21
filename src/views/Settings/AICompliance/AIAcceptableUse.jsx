import React from 'react';
import EditableCompliancePage from '../../../components/EditableCompliancePage/EditableCompliancePage';

const AIAcceptableUse = () => {
    const defaultTitle = "AI Acceptable Use Policy";
    const defaultHtmlContent = `
        <div class="mb-4">
            <p class="text-muted">Last updated: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="policy-section mb-4">
            <h4>1. Purpose</h4>
            <p>
                This policy outlines the acceptable use of Artificial Intelligence (AI) tools within Sisgate Hub to ensure compliance with legal obligations, protect intellectual property, and maintain data security.
            </p>
        </div>

        <div class="policy-section mb-4">
            <h4>2. Approved Tools</h4>
            <p>
                Staff are only permitted to use AI tools that have been formally approved by the organization.
                <br />
                <strong>Currently Approved:</strong>
                <ul>
                    <li>Sisgate Hub Built-in AI Assistants</li>
                    <li>Microsoft Copilot (Enterprise License)</li>
                    <li>ChatGPT (Enterprise/Team Plan only)</li>
                </ul>
                <em>Use of personal AI accounts for company business is strictly prohibited.</em>
            </p>
        </div>

        <div class="policy-section mb-4">
            <h4>3. Prohibited Uses</h4>
            <p>
                AI tools must <strong>NOT</strong> be used for:
                <ul>
                    <li>Generating discriminatory, hate speech, or offensive content.</li>
                    <li>Making automated decisions that have legal or significant effects on individuals without human review (e.g., hiring, lending).</li>
                    <li>Uploading Personal Identifiable Information (PII) or Sensitive Personal Data into public/non-enterprise AI models.</li>
                    <li>Generating code or content that violates third-party intellectual property rights.</li>
                </ul>
            </p>
        </div>

        <div class="policy-section mb-4">
            <h4>4. Human Oversight</h4>
            <p>
                AI constitutes a "support tool," not a replacement for professional judgment.
                <ul>
                    <li>All AI-generated output must be reviewed for accuracy, bias, and relevance before internal use or external distribution.</li>
                    <li>Users remain fully responsible for any work produced with the assistance of AI.</li>
                </ul>
            </p>
        </div>

        <div class="policy-section mb-4">
            <h4>5. Violation of Policy</h4>
            <p>
                Non-compliance with this policy may result in disciplinary action, up to and including termination of employment.
            </p>
        </div>
    `;

    return (
                <EditableCompliancePage
            pageKey="ai_acceptable_use"
            defaultTitle={defaultTitle}
            defaultHtmlContent={defaultHtmlContent}
        />
            );
};

export default AIAcceptableUse;

import React from 'react';
import EditableCompliancePage from '../../../components/EditableCompliancePage/EditableCompliancePage';

const AITransparencyNotice = () => {
    const defaultTitle = "Customer Disclosure / Transparency Notice";
    const defaultHtmlContent = `
        <div class="mb-4">
            <p class="text-muted">To be displayed on interfaces where users interact with AI.</p>
        </div>

        <div class="policy-section mb-4">
            <h4>Transparency Statement</h4>
            <p class="lead">
                "Portions of this service are assisted by Artificial Intelligence."
            </p>
        </div>

        <div class="policy-section mb-4">
            <h4>What this means for you</h4>
            <p>
                To provide you with faster and more accurate services, we utilize AI technology to:
                <ul>
                    <li>Draft responses and documents (which are reviewed by humans).</li>
                    <li>Summarize complex information.</li>
                    <li>Analyze data patterns.</li>
                </ul>
            </p>
        </div>

        <div class="policy-section mb-4">
            <h4>Limitations</h4>
            <p>
                While we strive for accuracy, AI systems can occasionally produce incorrect or biased information ("hallucinations").
                Please verify important details independently. We accept responsibility for the final output provided to you by our service.
            </p>
        </div>

        <div class="policy-section mb-4">
            <h4>EU AI Act Notice</h4>
            <p>
                <em>(If applicable: "You are interacting with an AI system.")</em>
            </p>
        </div>
    `;

    return (
                <EditableCompliancePage
            pageKey="ai_transparency"
            defaultTitle={defaultTitle}
            defaultHtmlContent={defaultHtmlContent}
        />
            );
};

export default AITransparencyNotice;

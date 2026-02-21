import React from 'react';
import EditableCompliancePage from '../../../components/EditableCompliancePage/EditableCompliancePage';

const AIStrategy = () => {
    const defaultTitle = "AI Posture & Intent Statement";
    const defaultHtmlContent = `
        <div class="mb-4">
            <p class="text-muted">Defining how and why we use AI.</p>
        </div>

        <form>
            <div class="policy-section mb-5">
                <h4>1. Strategic Intent</h4>
                <div class="mb-3">
                    <label class="form-label">Why are we adopting AI?</label>
                    <textarea class="form-control" rows="3" readonly>To automate routine administrative tasks, improve response times for client queries, and assist in drafting standard documents, allowing our team to focus on high-value strategic work.</textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">What will we NOT use AI for?</label>
                    <textarea class="form-control" rows="3" readonly>We will not use AI for final decision-making on hiring, legal advice without human review, or processing highly sensitive health data.</textarea>
                </div>
            </div>

            <div class="policy-section mb-4">
                <h4>2. Readiness Snapshot</h4>
                <div class="row mb-2">
                    <div class="col-sm-8"><strong>Leadership Clarity:</strong> Have we defined who owns "AI" decisions?</div>
                    <div class="col-sm-4">
                        <input class="form-control form-control-sm" type="text" value="Yes (Owner defined)" readonly />
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-sm-8"><strong>Data Hygiene:</strong> Is our data labeled and organized enough to be safe for AI?</div>
                    <div class="col-sm-4">
                        <input class="form-control form-control-sm" type="text" value="Yes (Clean/Structured)" readonly />
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-sm-8"><strong>Risk Tolerance:</strong> Are we comfortable with the specific risks of "Hallucination"?</div>
                    <div class="col-sm-4">
                        <input class="form-control form-control-sm" type="text" value="Low (Human reviews everything)" readonly />
                    </div>
                </div>
            </div>
        </form>
    `;

    return (
                <EditableCompliancePage
            pageKey="ai_strategy"
            defaultTitle={defaultTitle}
            defaultHtmlContent={defaultHtmlContent}
        />
            );
};

export default AIStrategy;

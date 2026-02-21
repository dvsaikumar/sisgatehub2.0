import React from 'react';
import EditableCompliancePage from '../../../components/EditableCompliancePage/EditableCompliancePage';

const AITrainingRecord = () => {
    const defaultTitle = "Staff AI Literacy / Training Record";
    const defaultHtmlContent = `
        <div class="mb-4">
            <p class="text-muted">Log of staff members who have completed mandatory AI awareness training.</p>
        </div>

        <div class="alert alert-warning mb-4">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Note:</strong> This page is currently a static template. To implement functional tracking, please use the dedicated training management module.
        </div>

        <div class="policy-section mb-4">
            <h4>Training Log Template</h4>
            <div class="table-responsive mt-3">
                <table class="table table-hover">
                    <thead class="bg-light">
                        <tr>
                            <th>Staff Name</th>
                            <th>Module</th>
                            <th>Completion Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>John Doe</td>
                            <td>AI Basics & Ethics</td>
                            <td>2023-10-15</td>
                            <td><span class="badge bg-success">Completed</span></td>
                        </tr>
                        <tr>
                            <td>Jane Smith</td>
                            <td>Generative AI Safety</td>
                            <td>2023-11-20</td>
                            <td><span class="badge bg-success">Completed</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return (
                <EditableCompliancePage
            pageKey="ai_training"
            defaultTitle={defaultTitle}
            defaultHtmlContent={defaultHtmlContent}
        />
            );
};

export default AITrainingRecord;

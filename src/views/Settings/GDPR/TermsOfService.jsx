import React from 'react';
import { Card, Container } from 'react-bootstrap';

const TermsOfService = () => {
    return (
        <Container fluid>
            <Card className="p-4">
                <div className="mb-4">
                    <h2 className="mb-3">Terms of Service</h2>
                    <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="policy-section mb-4">
                    <h4>1. Acceptance of Terms</h4>
                    <p>
                        By accessing or using Sisgate Hub, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>2. Acceptable Use Policy</h4>
                    <p>You agree not to use the Service to:</p>
                    <ul>
                        <li>Violate any laws or regulations.</li>
                        <li>Infringe upon the rights of others.</li>
                        <li>Upload malicious code or viruses.</li>
                        <li>Interfere with the operation of the Service.</li>
                    </ul>
                </div>

                <div className="policy-section mb-4">
                    <h4>3. Service Level Agreements (SLA)</h4>
                    <p>
                        We strive to maintain 99.9% uptime for our services. Scheduled maintenance will be communicated in advance. Compensation for downtime is limited to service credits as defined in your enterprise agreement.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>4. Limitation of Liability</h4>
                    <p>
                        In no event shall Sisgate Technologies or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Sisgate Hub.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>5. Termination</h4>
                    <p>
                        We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                    <p>
                        Upon termination, your right to use the Service will immediately cease.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>6. Changes to Terms</h4>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>7. Contact Us</h4>
                    <p>
                        If you have any questions about these Terms, please contact us at legal@sisgate.com.
                    </p>
                </div>
            </Card>
        </Container>
    );
};

export default TermsOfService;

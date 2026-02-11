import React from 'react';
import { Card, Container } from 'react-bootstrap';

const DataProcessingAgreement = () => {
    return (
        <Container fluid>
            <Card className="p-4">
                <div className="mb-4">
                    <h2 className="mb-3">Data Processing Agreement (DPA)</h2>
                    <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="policy-section mb-4">
                    <h4>1. Introduction</h4>
                    <p>
                        This Data Processing Agreement ("DPA") reflects the parties' agreement with respect to the processing of personal data in connection with the Sisgate Hub Subscription Services.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>2. Subprocessors</h4>
                    <p>
                        We engage third-party entities to assist us in providing the Services. A current list of our subprocessors is available upon request. We ensure all subprocessors enter into written agreements requiring them to protect Personal Data to the same standard provided in this DPA.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>3. Data Transfer Mechanisms</h4>
                    <p>
                        For transfers of Personal Data from the European Economic Area (EEA) to countries that do not have an adequacy decision, we rely on the European Commission's Standard Contractual Clauses (SCCs) as the valid transfer mechanism.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>4. Security Measures</h4>
                    <p>
                        We implement appropriate technical and organizational measures to protect Personal Data against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>5. Data Breach Notification</h4>
                    <p>
                        In the event of a Personal Data Breach, we will notify you without undue delay after becoming aware of the breach, providing relevant details to assist you in meeting your notification obligations.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>6. Audits</h4>
                    <p>
                        We will make available all information necessary to demonstrate compliance with this DPA and allow for and contribute to audits, including inspections, conducted by you or your auditor.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>7. Download Template</h4>
                    <p>
                        For B2B customers requiring a signed DPA, please download our standard template below:
                    </p>
                    <a href="#" className="btn btn-outline-primary btn-sm">Download Signed DPA (PDF)</a>
                </div>
            </Card>
        </Container>
    );
};

export default DataProcessingAgreement;

import React from 'react';
import { Card, Container } from 'react-bootstrap';

const PrivacyPolicy = () => {
    return (
        <Container fluid>
            <Card className="p-4">
                <div className="mb-4">
                    <h2 className="mb-3">Privacy Policy & GDPR Compliance</h2>
                    <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="policy-section mb-4">
                    <h4>1. Data Controller Identification</h4>
                    <p>
                        The data controller for Sisgate Hub is <strong>Sisgate Technologies Inc.</strong><br />
                        Address: 123 Tech Park, Suite 400<br />
                        Email: privacy@sisgate.com
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>2. Types of Data Collected</h4>
                    <p>We collect and process the following types of personal data:</p>
                    <ul>
                        <li><strong>Identity Data:</strong> Name, username, or similar identifier.</li>
                        <li><strong>Contact Data:</strong> Email address and telephone numbers.</li>
                        <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform.</li>
                        <li><strong>Usage Data:</strong> Information about how you use our website, products, and services.</li>
                    </ul>
                </div>

                <div className="policy-section mb-4">
                    <h4>3. Purpose of Data Processing</h4>
                    <p>We use your data for the following purposes:</p>
                    <ul>
                        <li>To provide and manage your account and access to our services.</li>
                        <li>To allow you to manage your documents, contacts, and reminders.</li>
                        <li>To communicate with you regarding account updates, security alerts, and support.</li>
                        <li>To improve and optimize our platform through analytics.</li>
                    </ul>
                </div>

                <div className="policy-section mb-4">
                    <h4>4. Legal Basis for Processing</h4>
                    <p>We process your personal data under the following legal bases:</p>
                    <ul>
                        <li><strong>Contractual Necessity:</strong> To fulfill our obligations under our Terms of Service.</li>
                        <li><strong>Consent:</strong> Where you have explicitly agreed to data processing (e.g., marketing).</li>
                        <li><strong>Legitimate Interests:</strong> For security, fraud prevention, and service improvement.</li>
                        <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations.</li>
                    </ul>
                </div>

                <div className="policy-section mb-4">
                    <h4>5. Data Retention Periods</h4>
                    <p>
                        We retain your personal data only for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                        <br />
                        - Active accounts: Duration of the account lifecycle.
                        <br />
                        - Deleted accounts: Data is removed or anonymized within 30 days, unless legally required otherwise.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>6. Third-Party Data Sharing</h4>
                    <p>We may share your data with trusted third-party service providers who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential and compliant with GDPR.</p>
                </div>

                <div className="policy-section mb-4">
                    <h4>7. International Data Transfers</h4>
                    <p>
                        Your data may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ. We ensure appropriate safeguards are in place for such transfers (e.g., Standard Contractual Clauses).
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>8. User Rights</h4>
                    <p>Under GDPR, you have the following rights:</p>
                    <ul>
                        <li><strong>Right to Access:</strong> You can request copies of your personal data.</li>
                        <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data.</li>
                        <li><strong>Right to Erasure:</strong> You can request deletion of your data ("Right to be Forgotten").</li>
                        <li><strong>Right to Restrict Processing:</strong> You can ask us to limit how we use your data.</li>
                        <li><strong>Right to Data Portability:</strong> You can request transfer of your data to another organization.</li>
                        <li><strong>Right to Object:</strong> You can object to our processing of your data.</li>
                    </ul>
                </div>

                <div className="policy-section mb-4">
                    <h4>9. Cookie Policy</h4>
                    <p>
                        We use necessary cookies for authentication and security (e.g., maintaining your session). We may also use analytical cookies to understand how our service is used. You can control cookie preferences through your browser settings.
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>10. Contact Information</h4>
                    <p>
                        If you have any questions about this Privacy Policy or wish to exercise your rights, please contact our Data Protection Officer at:<br />
                        <strong>Email:</strong> dpo@sisgate.com
                    </p>
                </div>

                <div className="policy-section mb-4">
                    <h4>11. Policy Updates</h4>
                    <p>
                        We may update this privacy policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Significant changes will be communicated via email or a prominent notice on our service.
                    </p>
                </div>
            </Card>
        </Container>
    );
};

export default PrivacyPolicy;

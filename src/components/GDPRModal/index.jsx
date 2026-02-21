import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ShieldCheck, Info } from '@phosphor-icons/react';

const GDPRModal = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check if the user has already accepted the GDPR terms on this device
        const hasAccepted = localStorage.getItem('gdpr_accepted');
        if (hasAccepted !== 'true') {
            setShow(true);
        }
    }, []);

    const handleAccept = () => {
        // Save acceptance to localStorage
        localStorage.setItem('gdpr_accepted', 'true');
        setShow(false);
    };

    return (
        <Modal
            show={show}
            backdrop="static" // Prevent closing by clicking outside
            keyboard={false}  // Prevent closing with ESC key
            size="lg"         // Large modal for content
            centered
            className="gdpr-modal"
        >
            <Modal.Header className="bg-slate-50 border-b border-slate-200">
                <Modal.Title className="flex items-center gap-2 text-slate-800 text-xl font-bold">
                    <ShieldCheck size={28} weight="fill" className="text-teal-600" />
                    Data Privacy & GDPR Acceptance
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-6 text-slate-600">
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r flex gap-3">
                        <Info size={24} weight="fill" className="text-indigo-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-indigo-900 m-0">
                            <strong>Welcome to Sisgate PRO Hub.</strong> Before you continue, please review our updated privacy policies and data usage terms in accordance with the General Data Protection Regulation (GDPR).
                        </p>
                    </div>

                    <section className="space-y-2">
                        <h4 className="text-lg font-semibold text-slate-800">1. Information We Collect</h4>
                        <p className="text-sm">
                            We collect personal information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about us or our products and Services, when you participate in activities on the App, or otherwise when you contact us. The personal information that we collect depends on the context of your interactions with us and the App, the choices you make, and the products and features you use.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h4 className="text-lg font-semibold text-slate-800">2. How We Use Your Information</h4>
                        <p className="text-sm">
                            We use personal information collected via our App for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                        </p>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            <li>To facilitate account creation and logon process.</li>
                            <li>To send administrative information to you regarding updates or changes to policies.</li>
                            <li>To fulfill and manage your orders, payments, returns, and exchanges made through the App.</li>
                            <li>To request feedback and to contact you about your use of our App.</li>
                            <li>To deliver and facilitate delivery of services to the user.</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h4 className="text-lg font-semibold text-slate-800">3. Your Data Rights</h4>
                        <p className="text-sm">
                            Depending on your location, you may have the following rights regarding your personal data:
                        </p>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            <li>The right to access – You have the right to request copies of your personal data.</li>
                            <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
                            <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                            <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                            <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
                            <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h4 className="text-lg font-semibold text-slate-800">4. Third-Party Services & Cookies</h4>
                        <p className="text-sm">
                            We use third-party tools to improve our service, ensure security, and provide analytics. These tools may use cookies and similar tracking technologies. By accepting these terms, you also consent to the essential cookies required to keep your session active and secure.
                        </p>
                    </section>

                </div>
            </Modal.Body>

            <Modal.Footer className="bg-slate-50 border-t border-slate-200 flex justify-between items-center sm:flex-row flex-col gap-3">
                <div className="text-xs text-slate-500 text-center sm:text-left">
                    By clicking "Accept All Conditions", you agree to our Terms of Service and Privacy Policy.
                </div>
                <Button
                    variant="primary"
                    onClick={handleAccept}
                    className="w-full sm:w-auto px-6 py-2 bg-teal-600 hover:bg-teal-700 border-none font-medium flex items-center justify-center gap-2"
                >
                    <ShieldCheck size={20} />
                    Accept All Conditions
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GDPRModal;

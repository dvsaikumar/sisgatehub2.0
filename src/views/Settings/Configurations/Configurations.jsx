import React from 'react';

import Mail from './Mail';
import Templates from './Templates';
import AI from './AI';
import PDFDesign from './PDFDesign';

const Configurations = ({ activeTab }) => {
    return (
        <div className="fm-body">
            <div className="container-fluid pt-0 px-0">
                {activeTab === 'mail' && <Mail />}
                {activeTab === 'templates' && <Templates />}
                {activeTab === 'ai' && <AI />}
                {activeTab === 'pdf_design' && <PDFDesign />}
            </div>
        </div>
    );
};

export default Configurations;

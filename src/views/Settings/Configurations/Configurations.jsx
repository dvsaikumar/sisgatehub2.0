import React from 'react';
import { Tab } from 'react-bootstrap';
import Mail from './Mail';
import Templates from './Templates';
import AI from './AI';
import PDFDesign from './PDFDesign';

const Configurations = ({ activeTab }) => {
    return (
        <div className="fm-body">
            <div className="container-fluid pt-0 px-0">
                <Tab.Content activeKey={activeTab}>
                    <Tab.Pane eventKey="mail" mountOnEnter unmountOnExit>
                        <Mail />
                    </Tab.Pane>
                    <Tab.Pane eventKey="templates" mountOnEnter unmountOnExit>
                        <Templates />
                    </Tab.Pane>
                    <Tab.Pane eventKey="ai" mountOnEnter unmountOnExit>
                        <AI />
                    </Tab.Pane>
                    <Tab.Pane eventKey="pdf_design" mountOnEnter unmountOnExit>
                        <PDFDesign />
                    </Tab.Pane>
                </Tab.Content>
            </div>
        </div>
    );
};

export default Configurations;

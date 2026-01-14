import React from 'react';
import { Tab } from 'react-bootstrap';
import Category from './Category';
import DocumentList from './DocumentList';
import GenerateDocument from './GenerateDocument';

const Documents = ({ activeTab }) => {
    return (
        <div className="fm-body">
            <div className="container-fluid pt-0 px-0">
                <Tab.Content activeKey={activeTab}>
                    <Tab.Pane eventKey="category">
                        <Category />
                    </Tab.Pane>
                    <Tab.Pane eventKey="document">
                        <DocumentList />
                    </Tab.Pane>
                    <Tab.Pane eventKey="generate_document">
                        <GenerateDocument />
                    </Tab.Pane>
                </Tab.Content>
            </div>
        </div>
    );
};

export default Documents;

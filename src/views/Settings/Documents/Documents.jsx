import React from 'react';

import Category from './Category';
import DocumentList from './DocumentList';
import GenerateDocument from './GenerateDocument';

const Documents = ({ activeTab }) => {
    return (
        <div className="fm-body">
            <div className="container-fluid pt-0 px-0">
                {activeTab === 'category' && <Category />}
                {activeTab === 'document' && <DocumentList />}
                {activeTab === 'generate_document' && <GenerateDocument />}
            </div>
        </div>
    );
};

export default Documents;

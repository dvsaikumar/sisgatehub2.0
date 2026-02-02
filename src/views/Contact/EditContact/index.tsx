import React, { useState } from 'react';
import classNames from 'classnames';
import ContactAppSidebar from '../ContactAppSidebar';
import EditContactBody from './EditContactBody';
import EditContactHeader from './EditContactHeader';

const EditContact: React.FC = () => {
    const [showSidebar, setShowSidebar] = useState<boolean>(false);

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames("contactapp-wrap", { "contactapp-sidebar-toggle": showSidebar })}>
                {/* @ts-ignore */}
                <ContactAppSidebar />
                <div className="contactapp-content">
                    <div className="contactapp-detail-wrap">
                        {/* @ts-ignore */}
                        <EditContactHeader toggleSidebar={() => setShowSidebar(!showSidebar)} show={showSidebar} />
                        {/* @ts-ignore */}
                        <EditContactBody />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default EditContact

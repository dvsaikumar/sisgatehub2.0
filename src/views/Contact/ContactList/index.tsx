import React, { useState } from 'react';
import ContactAppSidebar from '../ContactAppSidebar';
import ContactAppHeader from '../ContactAppHeader';
import ContactAppBody from './ContactAppBody';
import classNames from 'classnames';

const ContactList: React.FC = () => {
    const [showSidebar, setShowSidebar] = useState<boolean>(false);
    return (
        <div className="hk-pg-body py-0">
            <div className={classNames("contactapp-wrap", { "contactapp-sidebar-toggle": showSidebar })} >
                {/* @ts-ignore */}
                <ContactAppSidebar />
                <div className="contactapp-content">
                    <div className="contactapp-detail-wrap">
                        {/* @ts-ignore */}
                        <ContactAppHeader toggleSidebar={() => setShowSidebar(!showSidebar)} show={showSidebar} />
                        {/* @ts-ignore */}
                        <ContactAppBody />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ContactList

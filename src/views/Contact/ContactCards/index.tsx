import React, { useState } from 'react';
import classNames from 'classnames';
import ContactAppHeader from '../ContactAppHeader';
import ContactAppSidebar from '../ContactAppSidebar';
import ContactCardsBody from './ContactCardsBody';

const ContactCards: React.FC = () => {
    const [showSidebar, setShowSidebar] = useState<boolean>(false);
    return (
        <div className="hk-pg-body py-0">
            <div className={classNames("contactapp-wrap", { "contactapp-sidebar-toggle": showSidebar })}>
                {/* @ts-ignore */}
                <ContactAppSidebar />
                <div className="contactapp-content">
                    <div className="contactapp-detail-wrap">
                        {/* @ts-ignore */}
                        <ContactAppHeader toggleSidebar={() => setShowSidebar(!showSidebar)} show={showSidebar} />
                        {/* @ts-ignore */}
                        <ContactCardsBody />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ContactCards

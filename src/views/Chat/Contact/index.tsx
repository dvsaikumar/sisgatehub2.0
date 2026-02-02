import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import ChatHeader from '../ChatHeader';
import InvitePeopleModal from '../InvitePeopleModal';
import ChatBody from './ChatBody';
import ChatInfo from './ChatInfo';
import ContactList from './ContactList';
import Footer from './Footer';

//Redux
import { connect } from 'react-redux';
import { useWindowWidth } from '@react-hook/window-size';

interface ChatContactsProps {
    startChating: boolean;
}

const ChatContacts: React.FC<ChatContactsProps> = ({ startChating }) => {
    const [showInfo, setShowInfo] = useState<boolean>(true);
    const [invitePeople, setInvitePeople] = useState<boolean>(false);

    const windowWidth = useWindowWidth();
    useEffect(() => {
        if (windowWidth <= 1199) {
            setShowInfo(false);
        }
        else {
            setShowInfo(true)
        }
    }, [windowWidth])

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames("chatapp-wrap", { "chatapp-info-active": showInfo }, { "chatapp-slide": startChating })}>
                <div className="chatapp-content">
                    {/* @ts-ignore */}
                    <ContactList />
                    <div className="chatapp-single-chat">
                        {/* @ts-ignore */}
                        <ChatHeader infoState={showInfo} infoToggle={() => setShowInfo(!showInfo)} invitePeople={() => setInvitePeople(!invitePeople)} />
                        {/* @ts-ignore */}
                        <ChatBody />
                        {/* <ChatFooter /> */}
                        {/* @ts-ignore */}
                        <Footer />
                        {/* @ts-ignore */}
                        <ChatInfo infoToggle={() => setShowInfo(!showInfo)} />
                    </div>
                    {/* Invite People */}
                    {/* @ts-ignore */}
                    <InvitePeopleModal show={invitePeople} onClose={() => setInvitePeople(!invitePeople)} />
                </div>
            </div>
        </div>

    )
}

const mapStateToProps = ({ chatReducer }: any) => {
    const { startChating } = chatReducer;
    return { startChating }
};

export default connect(mapStateToProps)(ChatContacts);

import React, { useEffect, useState } from 'react';
import ContactList from './ContactList';
import ChatBody from './ChatBody';
import ChatInfo from './ChatInfo';
import ChatFooter from '../ChatFooter';
import classNames from 'classnames';
import InvitePeopleModal from '../InvitePeopleModal';
import ChatHeader from '../ChatHeader';
import { useWindowWidth } from '@react-hook/window-size';
//Redux
import { connect } from 'react-redux';
import { StartConversation } from '../../../redux/action/Chat';

interface ChatsProps {
    startChating: boolean;
    StartConversation: (id: number) => void;
}

const Chats: React.FC<ChatsProps> = ({ startChating }) => {

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
                    <ContactList invitePeople={() => setInvitePeople(!invitePeople)} />
                    <div className="chatapp-single-chat">
                        {/* @ts-ignore */}
                        <ChatHeader infoState={showInfo} infoToggle={() => setShowInfo(!showInfo)} invitePeople={() => setInvitePeople(!invitePeople)} />
                        {/* @ts-ignore */}
                        <ChatBody />
                        {/* @ts-ignore */}
                        <ChatFooter />
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

export default connect(mapStateToProps, { StartConversation })(Chats);

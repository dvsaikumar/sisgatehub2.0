import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useWindowWidth } from '@react-hook/window-size';
import Footer from './Footer';
import ChatHeader from '../ChatHeader';
import GroupChatBody from './GroupChatBody';
import GroupList from './GroupList';
import Info from './Info';
import InvitePeopleModal from '../InvitePeopleModal';
//Redux
import { connect } from 'react-redux';
import { StartConversation } from '../../../redux/action/Chat';

interface ChatGroupsProps {
    startChating: boolean;
    StartConversation: (id: number) => void;
}

const ChatGroups: React.FC<ChatGroupsProps> = ({ startChating }) => {
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
        <div className="hk-pg-body py-0" >
            <div className={classNames("chatapp-wrap", { "chatapp-info-active": showInfo }, { "chatapp-slide": startChating })}>
                <div className="chatapp-content">
                    {/* @ts-ignore */}
                    <GroupList />
                    <div className="chatapp-single-chat">
                        {/* @ts-ignore */}
                        <ChatHeader infoState={showInfo} infoToggle={() => setShowInfo(!showInfo)} invitePeople={() => setInvitePeople(!invitePeople)} />
                        {/* @ts-ignore */}
                        <GroupChatBody />
                        {/* <ChatFooter /> */}
                        {/* @ts-ignore */}
                        <Footer />
                        {/* @ts-ignore */}
                        <Info toggleInfo={() => setShowInfo(!showInfo)} invitePeople={() => setInvitePeople(!invitePeople)} />
                    </div>
                    {/* Invite People */}
                    {/* @ts-ignore */}
                    <InvitePeopleModal show={invitePeople} onClose={() => setInvitePeople(!invitePeople)} />
                </div>
            </div>
        </div >

    )
}

const mapStateToProps = ({ chatReducer }: any) => {
    const { startChating } = chatReducer;
    return { startChating }
};

export default connect(mapStateToProps, { StartConversation })(ChatGroups);

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, Dropdown } from 'react-bootstrap';
import { ArrowDown, CornerUpRight, MoreHorizontal } from 'react-feather';
import SimpleBar from 'simplebar-react';
//Redux
import { connect } from 'react-redux';
import { sentMsg } from '../../../redux/action/Chat';
//Images
import giphy from '../../../assets/img/giphy.gif'

import { supabase } from '../../../configs/supabaseClient';

const ChatBody = ({ sentMsg, msg, avatar, userName }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (data) {
                const formatted = data.map(m => ({
                    text: m.content,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    types: m.sender_id === user?.id ? 'sent' : 'received'
                }));
                setMessages(formatted);
            }
        };

        fetchMessages();

        const channel = supabase.channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                const { data: { user } } = await supabase.auth.getUser();
                const m = payload.new;
                const newMsg = {
                    text: m.content,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    types: m.sender_id === user?.id ? 'sent' : 'received'
                };
                setMessages(prev => [...prev, newMsg]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // 👇️ scroll to bottom every time messages change
    const bottomRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    return (
        <SimpleBar style={{ height: "100%" }} id="chat_body" className="chat-body">
            <ul id="dummy_avatar" className="list-unstyled chat-single-list">
                {
                    messages.map((elem, index) => (
                        <li className={classNames("media", (elem.types))} key={index}>
                            {elem.types === "received" && <div className="avatar avatar-xs avatar-rounded">
                                {typeof avatar === "string" && <img src={avatar} alt="user" className="avatar-img" />}
                                {typeof avatar === "object" && <div className={`avatar avatar-xs avatar-${avatar.variant} avatar-rounded`}>
                                    <span className="initial-wrap">{avatar.title}</span>
                                </div>}
                            </div>}
                            <div className="media-body">
                                <div className="msg-box" id="msg-1" >
                                    <div>
                                        <p>{elem.text}</p>
                                        <span className="chat-time">{elem.time}</span>
                                    </div>
                                    <div className="msg-action">
                                        <Button className="btn-icon btn-flush-dark btn-rounded flush-soft-hover no-caret">
                                            <span className="icon">
                                                <span className="feather-icon">
                                                    <CornerUpRight />
                                                </span>
                                            </span>
                                        </Button>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover dropdown-toggle no-caret">
                                                <span className="icon">
                                                    <span className="feather-icon">
                                                        <MoreHorizontal />
                                                    </span>
                                                </span>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu align="end">
                                                <Dropdown.Item href="#forward">Forward</Dropdown.Item>
                                                <Dropdown.Item href="#copy">Copy</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))
                }
            </ul>
            <div ref={bottomRef} />
        </SimpleBar>
    )
}

const mapStateToProps = ({ chatReducer }) => {
    const { msg, avatar, userName } = chatReducer;
    return { msg, avatar, userName }
};

export default connect(mapStateToProps, { sentMsg })(ChatBody);
import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Lifebuoy, Circle } from '@phosphor-icons/react';
import AIStatusFooter from './AIStatusFooter';

import { connect } from 'react-redux';
import { toggleChat } from '../../redux/action/ChatPopup';
import { ChatCircleDots } from '@phosphor-icons/react';

const PageFooter = ({ toggleChat, isChatOpen }) => {
    return (
        <div className="hk-footer hk-fixed-footer border-top bg-white">
            <Container fluid className="footer">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 py-2 ">
                    {/* Left Side: Copyright */}
                    <div className="order-2 order-md-1">
                        <p className="mb-0 text-muted fs-7">
                            <span className="fw-semibold text-dark">Sisgate Hub</span> © {new Date().getFullYear()} All rights reserved.
                        </p>
                    </div>

                    {/* Right Side: Links */}
                    <div className="d-flex flex-wrap align-items-center gap-4 order-1 order-md-2 justify-content-end flex-grow-1">
                        <AIStatusFooter />

                        {/* Chat Button */}
                        <div
                            className={`ai-status-pill cursor-pointer d-flex align-items-center gap-2 py-1 px-3 rounded-pill border shadow-sm transition-all hover-shadow-md ${isChatOpen ? 'bg-primary-light-5 border-primary' : 'bg-white'}`}
                            onClick={toggleChat}
                            style={{
                                fontSize: '0.75rem',
                                height: '32px',
                                background: isChatOpen ? 'rgba(0, 125, 136, 0.1)' : 'white'
                            }}
                        >
                            <ChatCircleDots size={16} weight={isChatOpen ? "fill" : "regular"} className={isChatOpen ? "text-primary" : "text-muted"} />
                            <span className={`fw-bold ${isChatOpen ? 'text-primary' : 'text-muted'}`}>Chat</span>
                        </div>

                        <div className="vr d-none d-md-block bg-secondary opacity-25" style={{ height: '24px' }}></div>
                        <Link to="#" className="d-flex align-items-center gap-2 text-secondary fs-7 text-decoration-none">
                            <Lifebuoy size={16} />
                            <span>Help Center</span>
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    )
}

const mapStateToProps = ({ chatPopupReducer }) => {
    const { isOpen } = chatPopupReducer;
    return { isChatOpen: isOpen }
};

export default connect(mapStateToProps, { toggleChat })(PageFooter)

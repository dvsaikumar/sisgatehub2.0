import { DIRECT_MSG, SEND_MSG, TOGGLE_CHAT } from "../constants/ChatPopup";

const initialState = {
    isOpen: false,
    msg: [
        { text: "I have a plan regarding pricing", time: "10:30 AM", types: "sent" },
        { text: "Welcome back! Is there anything I can help you with?", time: "10:35 AM", types: "received" }
    ],
    directMsgs: [],
};

const ChatPopupReducer = (state = initialState, action) => {
    switch (action.type) {
        case SEND_MSG:
            return {
                ...state,
                msg: [...state.msg, action.msg]
            };
        case DIRECT_MSG:
            return {
                ...state,
                directMsgs: [...state.directMsgs, action.directMsgs]
            };
        case TOGGLE_CHAT:
            return {
                ...state,
                isOpen: !state.isOpen
            };
        default:
            return state;
    }
};

export default ChatPopupReducer;
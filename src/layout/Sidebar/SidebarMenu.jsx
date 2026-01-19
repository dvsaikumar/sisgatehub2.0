import {
    Layout,
    Gear,
    Books,
    ChatDots,
    ChatCircle,
    Calendar,
    Tray,
    Kanban,
    AddressBook,
    Files,
    Image,
    ListChecks,
    Browser,
    Invoice,
    Code,
    UserPlus,
    UserList,
    File,
    FileCode,
    Stack,
    Robot
} from '@phosphor-icons/react';
import HkBadge from '../../components/@hk-badge/@hk-badge';

export const SidebarMenu = [
    {
        group: '',
        contents: [
            {
                name: 'Dashboard',
                icon: <Layout />,
                path: '/dashboard',
            },
            {
                name: 'Library',
                icon: <Books />,
                path: '/library',
            },
            {
                name: 'Reminders',
                icon: <Calendar />,
                path: '/reminders',
            },
            {
                name: 'Settings',
                icon: <Gear />,
                path: '/settings',
            },

        ]
    },
    {
        group: 'AI',
        contents: [
            {
                name: 'Create Doc',
                icon: <Robot />,
                path: '/apps/ai/create-doc',
            }
        ]
    },
    /* {
        group: 'Apps',
        contents: [

            {
                id: 'dash_chat',
                name: 'Chat',
                icon: <ChatDots />,
                path: '/apps/chat',
                childrens: [
                    {
                        name: 'Chats',
                        path: '/apps/chat/chats',
                        grp_name: "apps",
                    },
                    {
                        name: 'Groups',
                        path: '/apps/chat/chat-groups',
                        grp_name: "apps",
                    },
                    {
                        name: 'Contacts',
                        path: '/apps/chat/chat-contact',
                        grp_name: "apps",
                    },
                ]
            },
            {
                id: 'dash_chatpop',
                name: 'Chat Popup',
                icon: <ChatCircle />,
                path: '/apps/chat-bot',
                childrens: [
                    {
                        name: 'Direct Message',
                        path: '/apps/chat-bot/chatpopup',
                        grp_name: "apps",
                    },
                    {
                        name: 'Chatbot',
                        path: '/apps/chat-bot/chatbot',
                        grp_name: "apps",
                    },
                ]
            },
            {
                id: 'dash_chatpop',
                name: 'Calendar',
                icon: <Calendar />,
                path: '/apps/calendar',
                grp_name: "apps",
            },
            {
                name: 'Email',
                icon: <Tray />,
                path: '/apps/email',
                grp_name: "apps",
            },
            {
                id: "dash_scrumboard",
                name: 'Scrumboard',
                icon: <Kanban />,
                path: '/apps/taskboard',
                iconBadge: <HkBadge bg="primary" size="sm" pill className="position-top-end-overflow">3</HkBadge>,
                childrens: [
                    {
                        name: 'All Boards',
                        path: '/apps/taskboard/projects-board',
                        grp_name: "apps",
                    },
                    {
                        name: 'Project Kanban',
                        path: '/apps/taskboard/kanban-board',
                        grp_name: "apps",
                    },
                    {
                        name: 'Pipeline Kanban',
                        path: '/apps/taskboard/pipeline',
                        grp_name: "apps",
                    },
                ]
            },
            {
                id: "dash_contact",
                name: 'Contact',
                icon: <AddressBook />,
                path: '/apps/contacts',
                childrens: [
                    {
                        name: 'Contact List',
                        path: '/apps/contacts/contact-list',
                        grp_name: "apps",
                    },
                    {
                        name: 'Contact Cards',
                        path: '/apps/contacts/contact-cards',
                        grp_name: "apps",
                    },
                    {
                        name: 'Edit Contact',
                        path: '/apps/contacts/edit-contact',
                        grp_name: "apps",
                    },
                ]
            },
            {
                id: "dash_file",
                name: 'File Manager',
                icon: <Files />,
                path: '/apps/file-manager',
                childrens: [
                    {
                        name: 'List View',
                        path: '/apps/file-manager/list-view',
                        grp_name: "apps",
                    },
                    {
                        name: 'Grid View',
                        path: '/apps/file-manager/grid-view',
                        grp_name: "apps",
                    },
                ]
            },
            {
                name: 'Gallery',
                icon: <Image />,
                path: '/apps/gallery',
                grp_name: "apps",
            },
            {
                id: "dash_task",
                name: 'Todo',
                icon: <ListChecks />,
                path: '/apps/todo',
                badge: <HkBadge bg="success" soft className="ms-2">2</HkBadge>,
                childrens: [
                    {
                        name: 'Tasklist',
                        path: '/apps/todo/task-list',
                        grp_name: "apps",
                    },
                    {
                        name: 'Gantt',
                        path: '/apps/todo/gantt',
                        grp_name: "apps",
                    },
                ]
            },
            {
                id: "dash_blog",
                name: 'Blog',
                icon: <Browser />,
                path: '/apps/blog',
                childrens: [
                    {
                        name: 'Posts',
                        path: '/apps/blog/posts',
                        grp_name: "apps",
                    },
                    {
                        name: 'Add New Post',
                        path: '/apps/blog/add-new-post',
                        grp_name: "apps",
                    },
                    {
                        name: 'Post Detail',
                        path: '/apps/blog/post-detail',
                        grp_name: "apps",
                    },
                ]
            },
            {
                id: "dash_invoice",
                name: 'Invoices',
                icon: <Invoice />,
                path: '/apps/invoices',
                childrens: [
                    {
                        name: 'Invoice List',
                        path: '/apps/invoices/invoice-list',
                        grp_name: "apps",
                    },
                    {
                        name: 'Invoice Templates',
                        path: '/apps/invoices/invoice-templates',
                        grp_name: "apps",
                    },
                    {
                        name: 'Create Invoice',
                        path: '/apps/invoices/create-invoice',
                        grp_name: "apps",
                    },
                    {
                        name: 'Invoice Preview',
                        path: '/apps/invoices/invoice-preview',
                        grp_name: "apps",
                    },
                ]
            },
            {
                id: "dash_integ",
                name: 'Integrations',
                icon: <Code />,
                path: '/apps/integrations',
                childrens: [
                    {
                        name: 'All Apps',
                        path: '/apps/integrations/all-apps',
                        grp_name: "apps",
                    },
                    {
                        name: 'App Detail',
                        path: '/apps/integrations/integrations-detail',
                        grp_name: "apps",
                    },
                    {
                        name: 'Integrations',
                        path: '/apps/integrations/integration',
                        grp_name: "apps",
                    },
                ]
            },
        ]
    }, */

    /* Pages group hidden
    {
        group: 'Pages',
        contents: [
            {
                id: "dash_pages",
                name: 'Authentication',
                icon: <UserPlus />,
                path: '/auth',
                childrens: [
                    {
                        id: "dash_log",
                        name: 'Log In',
                        path: '/auth',
                        childrens: [
                            {
                                name: 'Login',
                                path: '/auth/login',
                            },
                            {
                                name: 'Login Simple',
                                path: '/auth/login-simple',
                            },
                            {
                                name: 'Login Classic',
                                path: '/auth/login-classic',
                            },
                        ]
                    },
                    {
                        id: "dash_sign",
                        name: 'Sign Up',
                        path: '/auth',
                        childrens: [
                            {
                                name: 'Signup',
                                path: '/auth/signup',
                            },
                            {
                                name: 'Signup Simple',
                                path: '/auth/signup-simple',
                            },
                            {
                                name: 'Signup Classic',
                                path: '/auth/signup-classic',
                            },
                        ]
                    },
                    {
                        name: 'Lock Screen',
                        path: '/auth/lock-screen',
                    },
                    {
                        name: 'Reset Password',
                        path: '/auth/reset-password',
                    },
                    {
                        name: 'Error 404',
                        path: '/error-404',
                    },
                    {
                        name: 'Error 503',
                        path: '/auth/error-503',
                    },
                ]
            },
            {
                id: "dash_profile",
                name: 'Profile',
                icon: <UserList />,
                path: '/pages',
                badgeIndicator: <HkBadge bg="danger" indicator className="position-absolute top-0 start-100" />,
                childrens: [
                    {
                        name: 'Profile',
                        path: '/pages/profile',
                        grp_name: "apps",
                    },
                    {
                        name: 'Edit Profile',
                        path: '/pages/edit-profile',
                        grp_name: "apps",
                    },
                    {
                        name: 'Account',
                        path: '/pages/account',
                        grp_name: "apps",
                    },
                ]
            },
            {
                name: 'Empty Page',
                icon: <File />,
                path: '/emptypage',
                grp_name: "apps",
            },

        ]
    },
    */

    /* Documentation group hidden
    {
        group: 'Documentation',
        contents: [
            {
                name: 'Documentation',
                icon: <FileCode />,
                path: 'https://jampack.hencework.com/documentation/introduction',
            },
            {
                name: 'Components',
                icon: <Stack />,
                path: 'https://jampack.hencework.com/documentation/avatar',
            },
        ]
    },
    */
]
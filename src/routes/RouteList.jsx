import React from 'react';

const AddNewPost = React.lazy(() => import("../views/Blog/AddNewPost"));
const PostDetail = React.lazy(() => import("../views/Blog/PostDetails"));
const Settings = React.lazy(() => import("../views/Settings"));
const Library = React.lazy(() => import("../views/Library"));
const Posts = React.lazy(() => import("../views/Blog/Posts"));
const Calendar = React.lazy(() => import("../views/Calendar"));
const Chats = React.lazy(() => import("../views/Chat/Chats"));
const ChatContacts = React.lazy(() => import("../views/Chat/Contact"));
const ChatGroups = React.lazy(() => import("../views/Chat/Groups"));
const ContactCards = React.lazy(() => import("../views/Contact/ContactCards"));
const ContactList = React.lazy(() => import("../views/Contact/ContactList"));
const EditContact = React.lazy(() => import("../views/Contact/EditContact"));
// Dashboard (TSX)
const Dashboard = React.lazy(() => import("../views/Dashboard"));
const Email = React.lazy(() => import("../views/Email"));
const GridView = React.lazy(() => import("../views/FileManager/GridView"));
const ListView = React.lazy(() => import("../views/FileManager/ListView"));
const EmptyPage = React.lazy(() => import("../views/EmptyPage"));
const Gallery = React.lazy(() => import("../views/Gallery"));
const AllApps = React.lazy(() => import("../views/Integrations/All Apps"));
const IntegrationsDetail = React.lazy(() => import("../views/Integrations/App Details"));
const Integration = React.lazy(() => import("../views/Integrations/Integration"));
const CreateInvoice = React.lazy(() => import("../views/Invoices/CreateInvoice"));
const InvoiceList = React.lazy(() => import("../views/Invoices/InvoiceList"));
const InvoiceTemplates = React.lazy(() => import("../views/Invoices/InvoiceTemplates"));
const PreviewInvoice = React.lazy(() => import("../views/Invoices/PreviewInvoice"));
const KanbanBoard = React.lazy(() => import("../views/Scrumboard/KanbanBoard/Index"));
const Pipeline = React.lazy(() => import("../views/Scrumboard/Pipeline"));
const ProjectsBoard = React.lazy(() => import("../views/Scrumboard/ProjectsBoard"));
const Gantt = React.lazy(() => import("../views/Todo/Gantt"));
const TaskList = React.lazy(() => import("../views/Todo/Tasklist"));
//Pages
const Profile = React.lazy(() => import("../views/Profiles/Profile"));
const EditProfile = React.lazy(() => import("../views/Profiles/EditProfile"));
const Account = React.lazy(() => import("../views/Profiles/Account"));
//Auth
const Login = React.lazy(() => import("../views/Authentication/LogIn/Login/Login"));
const LoginSimple = React.lazy(() => import("../views/Authentication/LogIn/LoginSimple"));
const LoginClassic = React.lazy(() => import("../views/Authentication/LogIn/LoginClassic"));
const Signup = React.lazy(() => import("../views/Authentication/SignUp/Signup"));
const SignUpSimple = React.lazy(() => import("../views/Authentication/SignUp/SignupSimple"));
const SignupClassic = React.lazy(() => import("../views/Authentication/SignUp/SignupClassic"));
const LockScreen = React.lazy(() => import("../views/Authentication/LockScreen"));
const ResetPassword = React.lazy(() => import("../views/Authentication/ResetPassword"));
const Error404 = React.lazy(() => import("../views/Authentication/Error404/Error404"));
const Error503 = React.lazy(() => import("../views/Authentication/Error503/Error503"));
const ChatPopup = React.lazy(() => import("../views/ChatPopup/DirectMessage"));
const ChatBot = React.lazy(() => import("../views/ChatPopup/ChatBot"));
const AuditLogs = React.lazy(() => import("../views/AuditLogs"));
const CreateDoc = React.lazy(() => import("../views/AI/CreateDoc/index"));
const ExploreFeatures = React.lazy(() => import("../views/ExploreFeatures"));


export const routes = [

    { path: 'dashboard', exact: true, component: Dashboard },
    { path: 'settings', exact: true, component: Settings },
    { path: 'library', exact: true, component: Library },
    { path: 'library/list-view', exact: true, component: Library },
    { path: 'library/grid-view', exact: true, component: Library },
    { path: 'audit-logs', exact: true, component: AuditLogs },
    { path: 'emptypage', exact: true, component: EmptyPage },
    { path: 'explore-features', exact: true, component: ExploreFeatures },
    { path: 'apps/ai/create-doc', exact: true, component: CreateDoc },
    //Apps
    { path: 'apps/chat/chats', exact: true, component: Chats },
    { path: 'apps/chat/chat-groups', exact: true, component: ChatGroups },
    { path: 'apps/chat/chat-contact', exact: true, component: ChatContacts },
    { path: 'apps/chat-bot/chatpopup', exact: true, component: ChatPopup },
    { path: 'apps/chat-bot/chatbot', exact: true, component: ChatBot },
    { path: 'reminders', exact: true, component: Calendar },
    { path: 'apps/email', exact: true, component: Email },
    { path: 'apps/taskboard/projects-board', exact: true, component: ProjectsBoard },
    { path: 'apps/taskboard/kanban-board', exact: true, component: KanbanBoard },
    { path: 'apps/taskboard/pipeline', exact: true, component: Pipeline },
    { path: 'apps/contacts/contact-list', exact: true, component: ContactList },
    { path: 'apps/contacts/contact-cards', exact: true, component: ContactCards },
    { path: 'apps/contacts/edit-contact', exact: true, component: EditContact },
    { path: 'apps/file-manager/list-view', exact: true, component: ListView },
    { path: 'apps/file-manager/grid-view', exact: true, component: GridView },
    { path: 'apps/gallery', exact: true, component: Gallery },
    { path: 'apps/todo/task-list', exact: true, component: TaskList },
    { path: 'apps/todo/gantt', exact: true, component: Gantt },
    { path: 'apps/blog/posts', exact: true, component: Posts },
    { path: 'apps/blog/add-new-post', exact: true, component: AddNewPost },
    { path: 'apps/blog/post-detail', exact: true, component: PostDetail },
    { path: 'apps/invoices/invoice-list', exact: true, component: InvoiceList },
    { path: 'apps/invoices/invoice-templates', exact: true, component: InvoiceTemplates },
    { path: 'apps/invoices/create-invoice', exact: true, component: CreateInvoice },
    { path: 'apps/invoices/invoice-preview', exact: true, component: PreviewInvoice },
    { path: 'apps/integrations/all-apps', exact: true, component: AllApps },
    { path: 'apps/integrations/integrations-detail', exact: true, component: IntegrationsDetail },
    { path: 'apps/integrations/integration', exact: true, component: Integration },
    //Pages
    { path: 'profile', exact: true, component: Profile },
    { path: 'edit-profile', exact: true, component: EditProfile },
    { path: 'pages/account', exact: true, component: Account },
    //Error
    { path: 'error-404', exact: true, component: Error404 },
]

export const authRoutes = [
    { path: 'login', exact: true, component: Login },
    { path: 'login-simple', exact: true, component: LoginSimple },
    { path: 'login-classic', exact: true, component: LoginClassic },
    { path: 'signup', exact: true, component: Signup },
    { path: 'signup-simple', exact: true, component: SignUpSimple },
    { path: 'signup-classic', exact: true, component: SignupClassic },
    { path: 'lock-screen', exact: true, component: LockScreen },
    { path: 'reset-password', exact: true, component: ResetPassword },
    { path: 'error-503', exact: true, component: Error503 },
]
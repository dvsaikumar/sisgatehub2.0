
import React from 'react';
import { Tab } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import Groups from './Groups';
import UsersList from './UsersList';
import AccessLevels from './AccessLevels';

const User = ({ activeTab }) => {
    return (
        <div className="fm-body">
            <div className="container-fluid pt-0 px-0">
                <Tab.Content activeKey={activeTab}>
                    <Tab.Pane eventKey="groups">
                        <Groups />
                    </Tab.Pane>
                    <Tab.Pane eventKey="users">
                        <UsersList />
                    </Tab.Pane>
                    <Tab.Pane eventKey="access_levels">
                        <AccessLevels />
                    </Tab.Pane>
                </Tab.Content>
            </div>
        </div>
    );
};

export default User;

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import FmHeader from '../FileManager/FmHeader';
import FmSidebar from '../FileManager/FmSidebar';
import FileInfo from '../FileManager/FileInfo';
import DummyList from './DummyList';
import classNames from 'classnames';

const EmptyPage = () => {
    const [showInfo, setShowInfo] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(toggleCollapsedNav(true));
        return () => {
            dispatch(toggleCollapsedNav(false));
        };
    }, [dispatch]);

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames("fmapp-wrap", { "fmapp-sidebar-toggle": !showSidebar }, { "fmapp-info-active": showInfo })}>
                <FmSidebar />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <FmHeader toggleSidebar={() => setShowSidebar(!showSidebar)} showSidebar={showSidebar} showInfo={showInfo} toggleInfo={() => setShowInfo(!showInfo)} />
                        <DummyList toggleInfo={() => setShowInfo(true)} />
                        <FileInfo onHide={() => setShowInfo(false)} />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default EmptyPage

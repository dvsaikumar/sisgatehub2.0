import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import FmHeader from '../FileManager/FmHeader';
import LibrarySidebar from './LibrarySidebar';
import LibraryList from './LibraryList';
import FileInfo from '../FileManager/FileInfo';
import classNames from 'classnames';

const Library = () => {
    const [showInfo, setShowInfo] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryName, setCategoryName] = useState('All Templates');
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
                <LibrarySidebar filter={filter} setFilter={setFilter} onCategorySelect={(name) => setCategoryName(name)} />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <FmHeader
                            title={filter === 'all' ? 'All Templates' : categoryName}
                            toggleSidebar={() => setShowSidebar(!showSidebar)}
                            showSidebar={showSidebar}
                            showInfo={showInfo}
                            toggleInfo={() => setShowInfo(!showInfo)}
                            onSearch={(val) => setSearchTerm(val)}
                            searchValue={searchTerm}
                        />
                        <LibraryList filter={filter} searchTerm={searchTerm} toggleInfo={() => setShowInfo(true)} />
                        {/* We can reuse FileInfo or create a LibraryInfo later */}
                        <FileInfo onHide={() => setShowInfo(false)} />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Library


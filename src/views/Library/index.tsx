import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import FmHeader from '../FileManager/FmHeader';
import LibrarySidebar from './LibrarySidebar';
import LibraryList from './LibraryList';
import FileInfo from '../FileManager/FileInfo';
import classNames from 'classnames';

const Library: React.FC = () => {
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [showSidebar, setShowSidebar] = useState<boolean>(true);
    const [filter, setFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [categoryName, setCategoryName] = useState<string>('All Templates');

    // View Mode Logic
    const location = useLocation();
    const navigate = useNavigate();
    const [viewMode, setViewModeState] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        if (location.pathname.includes('list-view')) {
            setViewModeState('list');
        } else if (location.pathname.includes('grid-view')) {
            setViewModeState('grid');
        } else {
            // Default
            setViewModeState('grid');
        }
    }, [location]);

    const handleSetViewMode = (mode: 'grid' | 'list') => {
        if (mode === 'list') {
            navigate('/library/list-view');
        } else {
            navigate('/library/grid-view');
        }
    };

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(toggleCollapsedNav(true));
        return () => {
            // @ts-ignore
            dispatch(toggleCollapsedNav(false));
        };
    }, [dispatch]);

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames("fmapp-wrap", { "fmapp-sidebar-toggle": !showSidebar }, { "fmapp-info-active": showInfo })}>
                {/* @ts-ignore */}
                <LibrarySidebar filter={filter} setFilter={setFilter} onCategorySelect={(name: string) => setCategoryName(name)} />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <FmHeader
                            title={filter === 'all' ? 'All Templates' : categoryName}
                            toggleSidebar={() => setShowSidebar(!showSidebar)}
                            showSidebar={showSidebar}
                            showInfo={showInfo}
                            toggleInfo={() => setShowInfo(!showInfo)}
                            onSearch={(val: any) => setSearchTerm(val)}
                            searchValue={searchTerm}
                            viewMode={viewMode}
                            setViewMode={handleSetViewMode}
                            children={undefined}
                        />
                        {/* @ts-ignore */}
                        <LibraryList filter={filter} searchTerm={searchTerm} toggleInfo={() => setShowInfo(true)} viewMode={viewMode} />
                        {/* We can reuse FileInfo or create a LibraryInfo later */}
                        <FileInfo onHide={() => setShowInfo(false)} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Library

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuditService } from '../../services/AuditService';
import DayJS from 'dayjs';
import { Download, Funnel, User } from '@phosphor-icons/react';
import classNames from 'classnames';

const AuditLogs: React.FC = () => {
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        userId: ''
    });

    const { data: logsData, isLoading, isError } = useQuery({
        queryKey: ['auditLogs', page, filters],
        queryFn: () => AuditService.fetchLogs({ page, ...filters }),
        // refetchInterval: 30000 
    });

    const handleExport = async () => {
        try {
            const data = await AuditService.exportLogs();
            if (!data) return;

            const csvContent = "data:text/csv;charset=utf-8,"
                + "Timestamp,User,Action,Resource,Details\n"
                + data.map(row => {
                    const details = JSON.stringify(row.details || {}).replace(/"/g, '""');
                    return `${row.created_at},${row.user?.email || row.user_id},${row.action},${row.resource},"${details}"`
                }).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `audit_logs_${DayJS().format('YYYY-MM-DD')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (e) {
            console.error("Export failed", e);
        }
    };

    return (
        <div className="container-xxl">
            {/* Header */}
            <div className="hk-pg-header pg-header-w-sidebar-toggler pt-5 mb-4">
                <div className="d-flex">
                    <div className="d-flex flex-wrap justify-content-between flex-1">
                        <div className="mb-lg-0 mb-2 ms-lg-0 ms-3">
                            <h1 className="pg-title">Audit Logs</h1>
                            <p>Track all user activities and system events.</p>
                        </div>
                        <div className="pg-header-action-wrap">
                            <button className="btn btn-primary" onClick={handleExport}>
                                <Download weight="bold" className="me-2" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label text-muted">Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.startDate}
                                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label text-muted">End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.endDate}
                                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label text-muted">Filter</label>
                            <button className="btn btn-outline-light w-100 d-flex align-items-center text-secondary justify-content-center" disabled>
                                <Funnel className="me-2" /> More Filters Coming Soon
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card card-border mb-0 h-100">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="thead-light">
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && (
                                    <tr><td colSpan={5} className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td></tr>
                                )}

                                {isError && (
                                    <tr><td colSpan={5} className="text-center py-5 text-danger">Start the Supabase backend or Check permissions.</td></tr>
                                )}

                                {!isLoading && !isError && logsData?.data.map((log) => (
                                    <tr key={log.id}>
                                        <td className="text-nowrap text-secondary font-monospace" style={{ fontSize: '0.85rem' }}>
                                            {DayJS(log.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="avatar avatar-xs avatar-rounded me-2">
                                                    <span className="initial-wrap bg-primary-light-5 text-primary">
                                                        {log.user?.email?.[0]?.toUpperCase() || <User />}
                                                    </span>
                                                </div>
                                                <span className="text-truncate" style={{ maxWidth: '150px' }} title={log.user?.email}>
                                                    {log.user?.email || log.user_id}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={classNames("badge badge-soft-secondary", {
                                                "badge-soft-success": log.action === 'CREATE_DOC',
                                                "badge-soft-danger": log.action === 'DELETE',
                                                "badge-soft-primary": log.action === 'LOGIN'
                                            })}>{log.action}</span>
                                        </td>
                                        <td className="text-dark">{log.resource}</td>
                                        <td className="text-truncate" style={{ maxWidth: '200px', fontSize: '0.85rem' }} title={JSON.stringify(log.details)}>
                                            {JSON.stringify(log.details)}
                                        </td>
                                    </tr>
                                ))}

                                {!isLoading && logsData?.data.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-5 text-muted">No logs found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Pagination (Simple) */}
                <div className="card-footer d-flex justify-content-between align-items-center">
                    <button className="btn btn-sm btn-outline-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span className="text-muted small">Page {page + 1}</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;

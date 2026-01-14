import React, { useEffect, useState } from 'react';
import { Col, Container, Row, Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { supabase } from '../../configs/supabaseClient';
import { Link } from 'react-router-dom';
import {
    FileText,
    Bell,
    Folder,
    Calendar,
    Plus,
    ArrowRight,
    Clock,
    BookOpen,
    Activity,
    TrendingUp
} from 'react-feather';
import moment from 'moment';

const Dashboard = ({ navCollapsed, toggleCollapsedNav }) => {
    const [reminders, setReminders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [stats, setStats] = useState({
        totalDocuments: 0,
        upcomingReminders: 0,
        recentActivity: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        toggleCollapsedNav(false);
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch upcoming reminders
            const { data: remindersData } = await supabase
                .from('app_reminders')
                .select('*')
                .gte('schedule_at', new Date().toISOString())
                .order('schedule_at', { ascending: true })
                .limit(5);

            // Fetch recent documents
            const { data: docsData } = await supabase
                .from('app_documents')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(6);

            // Fetch statistics
            const { count: docCount } = await supabase
                .from('app_documents')
                .select('*', { count: 'exact', head: true });

            const { count: reminderCount } = await supabase
                .from('app_reminders')
                .select('*', { count: 'exact', head: true })
                .gte('schedule_at', new Date().toISOString());

            setReminders(remindersData || []);
            setDocuments(docsData || []);
            setStats({
                totalDocuments: docCount || 0,
                upcomingReminders: reminderCount || 0,
                recentActivity: (docCount || 0) + (reminderCount || 0)
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            {/* Page Header */}
            <div className="hk-pg-header pt-7">
                <Row>
                    <Col sm>
                        <div className="d-flex align-items-center">
                            <div className="d-flex">
                                <div>
                                    <h1 className="pg-title">Dashboard</h1>
                                    <p className="mb-0">Welcome to Sisgate PRO Hub</p>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col sm="auto" className="d-flex align-items-center">
                        <Link to="/apps/ai/create-doc" className="text-decoration-none">
                            <Button variant="primary" size="sm" className="btn-rounded">
                                <Plus size={16} className="me-1" />
                                Create Document
                            </Button>
                        </Link>
                    </Col>
                </Row>
            </div>

            {/* Page Body */}
            <div className="hk-pg-body py-0">
                {/* Statistics Cards */}
                <Row className="mb-3">
                    <Col lg={4} sm={6} className="mb-3">
                        <Card className="card-border">
                            <Card.Body>
                                <div className="media">
                                    <div className="media-head me-3">
                                        <div className="avatar avatar-icon avatar-sm avatar-soft-primary avatar-rounded">
                                            <span className="initial-wrap">
                                                <FileText size={20} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="media-body">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <span className="d-block text-uppercase fs-8 fw-medium text-muted mb-1">Documents</span>
                                                <span className="d-block display-6 fw-bold text-dark mb-0">{stats.totalDocuments}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4} sm={6} className="mb-3">
                        <Card className="card-border">
                            <Card.Body>
                                <div className="media">
                                    <div className="media-head me-3">
                                        <div className="avatar avatar-icon avatar-sm avatar-soft-warning avatar-rounded">
                                            <span className="initial-wrap">
                                                <Bell size={20} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="media-body">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <span className="d-block text-uppercase fs-8 fw-medium text-muted mb-1">Reminders</span>
                                                <span className="d-block display-6 fw-bold text-dark mb-0">{stats.upcomingReminders}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4} sm={6} className="mb-3">
                        <Card className="card-border">
                            <Card.Body>
                                <div className="media">
                                    <div className="media-head me-3">
                                        <div className="avatar avatar-icon avatar-sm avatar-soft-success avatar-rounded">
                                            <span className="initial-wrap">
                                                <TrendingUp size={20} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="media-body">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <span className="d-block text-uppercase fs-8 fw-medium text-muted mb-1">Activity</span>
                                                <span className="d-block display-6 fw-bold text-dark mb-0">{stats.recentActivity}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row className="mb-3">
                    <Col md={12}>
                        <div className="card-header card-header-action">
                            <h6 className="mb-0">Quick Actions</h6>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col xl={3} sm={6} className="mb-3">
                        <Link to="/apps/ai/create-doc" className="text-decoration-none">
                            <Card className="card-border card-hover">
                                <Card.Body className="text-center">
                                    <div className="avatar avatar-icon avatar-lg avatar-soft-primary avatar-rounded mb-3">
                                        <span className="initial-wrap">
                                            <FileText size={28} />
                                        </span>
                                    </div>
                                    <span className="d-block fw-medium text-dark">Create Document</span>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                    <Col xl={3} sm={6} className="mb-3">
                        <Link to="/library" className="text-decoration-none">
                            <Card className="card-border card-hover">
                                <Card.Body className="text-center">
                                    <div className="avatar avatar-icon avatar-lg avatar-soft-success avatar-rounded mb-3">
                                        <span className="initial-wrap">
                                            <Folder size={28} />
                                        </span>
                                    </div>
                                    <span className="d-block fw-medium text-dark">View Library</span>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                    <Col xl={3} sm={6} className="mb-3">
                        <Link to="/reminders" className="text-decoration-none">
                            <Card className="card-border card-hover">
                                <Card.Body className="text-center">
                                    <div className="avatar avatar-icon avatar-lg avatar-soft-warning avatar-rounded mb-3">
                                        <span className="initial-wrap">
                                            <Bell size={28} />
                                        </span>
                                    </div>
                                    <span className="d-block fw-medium text-dark">Reminders</span>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                    <Col xl={3} sm={6} className="mb-3">
                        <Link to="/apps/calendar" className="text-decoration-none">
                            <Card className="card-border card-hover">
                                <Card.Body className="text-center">
                                    <div className="avatar avatar-icon avatar-lg avatar-soft-info avatar-rounded mb-3">
                                        <span className="initial-wrap">
                                            <Calendar size={28} />
                                        </span>
                                    </div>
                                    <span className="d-block fw-medium text-dark">Calendar</span>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                </Row>

                {/* Content Sections */}
                <Row>
                    {/* Upcoming Reminders */}
                    <Col lg={6} className="mb-3">
                        <Card className="card-border">
                            <Card.Header className="card-header-action">
                                <h6 className="mb-0">Upcoming Reminders</h6>
                                <div className="card-action-wrap">
                                    <Link to="/reminders" className="text-muted">
                                        <span className="feather-icon">
                                            <ArrowRight size={16} />
                                        </span>
                                    </Link>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5 text-muted">
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Loading...
                                    </div>
                                ) : reminders.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <Bell size={40} className="text-muted opacity-50" />
                                        </div>
                                        <p className="text-muted mb-0">No upcoming reminders</p>
                                    </div>
                                ) : (
                                    <ListGroup variant="flush">
                                        {reminders.map((reminder, idx) => (
                                            <ListGroup.Item key={idx} className="py-3">
                                                <div className="media">
                                                    <div className="media-head me-3">
                                                        <div className="avatar avatar-xs avatar-soft-warning avatar-rounded">
                                                            <span className="initial-wrap">
                                                                <Clock size={14} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="media-body">
                                                        <div>
                                                            <div className="fw-medium text-dark mb-1">{reminder.title}</div>
                                                            <div className="fs-7 text-muted">
                                                                {moment(reminder.schedule_at).format('MMM D, YYYY [at] h:mm A')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Recent Documents */}
                    <Col lg={6} className="mb-3">
                        <Card className="card-border">
                            <Card.Header className="card-header-action">
                                <h6 className="mb-0">Recent Documents</h6>
                                <div className="card-action-wrap">
                                    <Link to="/library" className="text-muted">
                                        <span className="feather-icon">
                                            <ArrowRight size={16} />
                                        </span>
                                    </Link>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5 text-muted">
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Loading...
                                    </div>
                                ) : documents.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <BookOpen size={40} className="text-muted opacity-50" />
                                        </div>
                                        <p className="text-muted mb-0">No documents yet</p>
                                    </div>
                                ) : (
                                    <ListGroup variant="flush">
                                        {documents.map((doc, idx) => (
                                            <ListGroup.Item key={idx} className="py-3">
                                                <div className="media">
                                                    <div className="media-head me-3">
                                                        <div className="avatar avatar-xs avatar-soft-primary avatar-rounded">
                                                            <span className="initial-wrap">
                                                                <FileText size={14} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="media-body">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <div className="fw-medium text-dark mb-1">{doc.name}</div>
                                                                <div className="fs-7 text-muted">
                                                                    {doc.category} • {moment(doc.created_at).fromNow()}
                                                                </div>
                                                            </div>
                                                            <Badge bg="light" text="dark" className="ms-2">{doc.type}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed };
};

export default connect(mapStateToProps, { toggleCollapsedNav })(Dashboard);
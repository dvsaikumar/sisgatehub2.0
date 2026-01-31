import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Spinner, Button, ListGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleCollapsedNav } from '../../../redux/action/Theme';
import { supabase } from '../../../configs/supabaseClient';
import HkBadge from '../../../components/@hk-badge/@hk-badge';
import HkTooltip from '../../../components/@hk-tooltip/HkTooltip';
import { User, Envelope, Phone, MapPin, Briefcase, Calendar, PencilSimple } from '@phosphor-icons/react';
import dayjs from 'dayjs';

// Images
import bgImg from '../../../assets/img/profile-bg.jpg';
import avatar12 from '../../../assets/img/avatar12.jpg';

const Profile = ({ toggleCollapsedNav }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        toggleCollapsedNav(false);

        const fetchUserProfile = async () => {
            try {
                setLoading(true);

                // Get authenticated user first (required for profile query)
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!isMounted) return;

                if (!authUser?.id) {
                    setLoading(false);
                    return;
                }

                setUser(authUser);

                // Fetch profile - this is fast since we have the ID
                const { data: profileData } = await supabase
                    .from('user_profiles')
                    .select('full_name, email, phone, location, company, website, bio, role, avatar_url')
                    .eq('id', authUser.id)
                    .single();

                if (isMounted && profileData) {
                    setProfile(profileData);
                }
            } catch (error) {
                // Ignore AbortError
                if (error?.name !== 'AbortError') {
                    console.error('Error fetching profile:', error);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUserProfile();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Get display values
    const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const email = profile?.email || user?.email || 'No email';
    const phone = profile?.phone || user?.user_metadata?.phone || 'Not provided';
    const role = profile?.role || 'Member';
    const company = profile?.company || user?.user_metadata?.company || 'Sisgate Hub';
    const location = profile?.location || user?.user_metadata?.location || 'Not specified';
    const bio = profile?.bio || user?.user_metadata?.bio || 'No bio available';
    const createdAt = user?.created_at ? dayjs(user.created_at).format('MMMM D, YYYY') : 'Unknown';
    const lastSignIn = user?.last_sign_in_at ? dayjs(user.last_sign_in_at).format('MMMM D, YYYY [at] h:mm A') : 'Unknown';

    if (loading) {
        return (
            <div className="hk-pg-body d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="hk-pg-body" style={{ padding: 0 }}>
            <Container fluid style={{ padding: 0, maxWidth: '100%' }}>
                <div className="profile-wrap" style={{ padding: '0 24px' }}>
                    {/* Cover Image */}
                    <div className="profile-img-wrap">
                        <img className="img-fluid rounded-5" src={bgImg} alt="Profile Cover" />
                    </div>

                    {/* Profile Intro Section */}
                    <div className="profile-intro">
                        <Card className="card-flush mw-400p bg-transparent">
                            <Card.Body>
                                <div className="avatar avatar-xxl avatar-rounded position-relative mb-2">
                                    <img
                                        src={profile?.avatar_url || avatar12}
                                        alt="user"
                                        className="avatar-img border border-4 border-white"
                                        style={{
                                            objectFit: 'cover',
                                            objectPosition: 'center',
                                            width: '100%',
                                            height: '100%'
                                        }}
                                        onError={(e) => { e.target.src = avatar12; }}
                                    />
                                    <HkBadge bg="success" indicator className="badge-indicator-xl position-bottom-end-overflow-1 me-1" />
                                </div>
                                <h4>
                                    {fullName}
                                    <HkTooltip title="Verified User" placement="top">
                                        <i className="bi-check-circle-fill fs-6 text-blue ms-1" />
                                    </HkTooltip>
                                </h4>
                                <p className="text-muted mb-2">{role}</p>
                                <ul className="list-inline fs-7 mt-2 mb-0">
                                    <li className="list-inline-item d-sm-inline-block d-block mb-sm-0 mb-1 me-3">
                                        <i className="bi bi-briefcase me-1" />
                                        <span>{company}</span>
                                    </li>
                                    <li className="list-inline-item d-sm-inline-block d-block mb-sm-0 mb-1 me-3">
                                        <i className="bi bi-geo-alt me-1" />
                                        <span>{location}</span>
                                    </li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Row className="mt-5">
                        {/* Left Column - User Info */}
                        <Col lg={4} className="mb-lg-0 mb-3">
                            {/* Profile Card */}
                            <Card className="card-border mb-4">
                                <Card.Header className="card-header-action">
                                    <h6 className="mb-0">Profile Information</h6>
                                    <div className="card-action-wrap">
                                        <Button
                                            as={Link}
                                            to="/edit-profile"
                                            variant="soft-primary"
                                            size="sm"
                                            className="btn-icon btn-rounded"
                                        >
                                            <PencilSimple size={16} />
                                        </Button>
                                    </div>
                                </Card.Header>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="border-0">
                                        <div className="d-flex align-items-center">
                                            <User size={18} className="text-muted me-3" />
                                            <div>
                                                <span className="text-muted d-block fs-8">Full Name</span>
                                                <span className="fw-medium">{fullName}</span>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0">
                                        <div className="d-flex align-items-center">
                                            <Envelope size={18} className="text-muted me-3" />
                                            <div>
                                                <span className="text-muted d-block fs-8">Email</span>
                                                <span className="fw-medium">{email}</span>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0">
                                        <div className="d-flex align-items-center">
                                            <Phone size={18} className="text-muted me-3" />
                                            <div>
                                                <span className="text-muted d-block fs-8">Phone</span>
                                                <span className="fw-medium">{phone}</span>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0">
                                        <div className="d-flex align-items-center">
                                            <Briefcase size={18} className="text-muted me-3" />
                                            <div>
                                                <span className="text-muted d-block fs-8">Company</span>
                                                <span className="fw-medium">{company}</span>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0">
                                        <div className="d-flex align-items-center">
                                            <MapPin size={18} className="text-muted me-3" />
                                            <div>
                                                <span className="text-muted d-block fs-8">Location</span>
                                                <span className="fw-medium">{location}</span>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card>

                            {/* Account Info Card */}
                            <Card className="card-border mb-4">
                                <Card.Header>
                                    <h6 className="mb-0">Account Information</h6>
                                </Card.Header>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="border-0">
                                        <div className="d-flex align-items-center">
                                            <Calendar size={18} className="text-muted me-3" />
                                            <div>
                                                <span className="text-muted d-block fs-8">Member Since</span>
                                                <span className="fw-medium">{createdAt}</span>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0">
                                        <div className="d-flex align-items-center">
                                            <Calendar size={18} className="text-muted me-3" />
                                            <div>
                                                <span className="text-muted d-block fs-8">Last Sign In</span>
                                                <span className="fw-medium">{lastSignIn}</span>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0">
                                        <div className="d-flex align-items-center">
                                            <User size={18} className="text-muted me-3" />
                                            <div>
                                                <span className="text-muted d-block fs-8">User ID</span>
                                                <span className="fw-medium text-truncate" style={{ maxWidth: '200px', display: 'block' }}>
                                                    {user?.id || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>

                        {/* Right Column - Bio & Activity */}
                        <Col lg={8}>
                            {/* Bio Card */}
                            <Card className="card-border mb-4">
                                <Card.Header className="card-header-action">
                                    <h6 className="mb-0">About Me</h6>
                                    <div className="card-action-wrap">
                                        <Button
                                            as={Link}
                                            to="/edit-profile"
                                            variant="soft-primary"
                                            size="sm"
                                        >
                                            Edit Profile
                                        </Button>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <p className="mb-0" style={{ lineHeight: '1.8' }}>
                                        {bio}
                                    </p>
                                </Card.Body>
                            </Card>

                            {/* Quick Stats */}
                            <Row className="g-3 mb-4">
                                <Col sm={4}>
                                    <Card className="card-border text-center">
                                        <Card.Body>
                                            <h3 className="mb-1 text-primary">0</h3>
                                            <span className="text-muted fs-7">Documents</span>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={4}>
                                    <Card className="card-border text-center">
                                        <Card.Body>
                                            <h3 className="mb-1 text-success">0</h3>
                                            <span className="text-muted fs-7">Reminders</span>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={4}>
                                    <Card className="card-border text-center">
                                        <Card.Body>
                                            <h3 className="mb-1 text-info">0</h3>
                                            <span className="text-muted fs-7">Events</span>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Authentication Provider */}
                            <Card className="card-border">
                                <Card.Header>
                                    <h6 className="mb-0">Authentication</h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <p className="mb-1 fw-medium">Email Authentication</p>
                                            <span className="text-muted fs-7">
                                                Signed in with {user?.app_metadata?.provider || 'email'}
                                            </span>
                                        </div>
                                        <HkBadge bg="soft-success" className="text-success">Active</HkBadge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed };
};

export default connect(mapStateToProps, { toggleCollapsedNav })(Profile);
import React, { useEffect, useState, useRef } from 'react';
import { Button, Col, Container, Form, Nav, Row, Tab, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../../redux/action/Theme';
import { supabase } from '../../../configs/supabaseClient';
import toast from 'react-hot-toast';
import { Camera, Check, Warning } from '@phosphor-icons/react';

// Default avatar
import defaultAvatar from '../../../assets/img/avatar12.jpg';

const EditProfile = ({ toggleCollapsedNav }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [user, setUser] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        full_name: '',
        email: '',
        phone: '',
        location: '',
        company: '',
        website: '',
        bio: '',
        role: 'Member',
        phone_private: false,
        avatar_url: ''
    });

    useEffect(() => {
        let isMounted = true;
        toggleCollapsedNav(false);

        const fetchUserProfile = async () => {
            try {
                setLoading(true);

                // Get authenticated user
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!isMounted) return;
                setUser(authUser);

                if (authUser?.id) {
                    // Fetch profile from user_profiles table
                    const { data: profile, error } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', authUser.id)
                        .single();

                    if (!isMounted) return;

                    if (!error && profile) {
                        // Split full_name into first and last if first_name is empty
                        let firstName = profile.first_name || '';
                        let lastName = profile.last_name || '';

                        if (!firstName && profile.full_name) {
                            const nameParts = profile.full_name.split(' ');
                            firstName = nameParts[0] || '';
                            lastName = nameParts.slice(1).join(' ') || '';
                        }

                        setFormData({
                            first_name: firstName,
                            last_name: lastName,
                            full_name: profile.full_name || '',
                            email: profile.email || authUser.email || '',
                            phone: profile.phone || '',
                            location: profile.location || '',
                            company: profile.company || '',
                            website: profile.website || '',
                            bio: profile.bio || '',
                            role: profile.role || 'Member',
                            phone_private: profile.phone_private || false,
                            avatar_url: profile.avatar_url || ''
                        });

                        if (profile.avatar_url) {
                            setAvatarPreview(profile.avatar_url);
                        }
                    } else {
                        // Pre-fill with auth data if no profile exists
                        const meta = authUser.user_metadata || {};
                        setFormData(prev => ({
                            ...prev,
                            first_name: meta.first_name || '',
                            last_name: meta.last_name || '',
                            full_name: meta.full_name || meta.name || '',
                            email: authUser.email || ''
                        }));
                    }
                }
            } catch (error) {
                // Ignore AbortError
                if (error?.name !== 'AbortError') {
                    console.error('Error fetching profile:', error);
                    toast.error('Failed to load profile data');
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        try {
            setUploadingAvatar(true);

            // Create preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload to Supabase Storage - file path should NOT include bucket name
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}.${fileExt}`;

            // Delete old avatar first (if exists)
            await supabase.storage.from('avatars').remove([fileName]);

            const { error: uploadError, data } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                toast.error('Upload failed: ' + uploadError.message);
                return;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;
            console.log('Avatar uploaded:', publicUrl);

            setFormData(prev => ({
                ...prev,
                avatar_url: publicUrl
            }));

            toast.success('Avatar uploaded successfully!');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to upload avatar. Image preview saved locally.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!user?.id) {
            toast.error('No user found. Please log in again.');
            return;
        }

        try {
            setSaving(true);

            // Combine first and last name
            const fullName = `${formData.first_name} ${formData.last_name}`.trim();

            const updateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                full_name: fullName,
                phone: formData.phone,
                location: formData.location,
                company: formData.company,
                website: formData.website,
                bio: formData.bio,
                role: formData.role,
                phone_private: formData.phone_private,
                avatar_url: formData.avatar_url
            };

            const { error } = await supabase
                .from('user_profiles')
                .update(updateData)
                .eq('id', user.id);

            if (error) throw error;

            toast.success('Profile updated successfully!');

            // Update formData with new full_name
            setFormData(prev => ({ ...prev, full_name: fullName }));

        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                redirectTo: window.location.origin + '/auth/reset-password'
            });

            if (error) throw error;

            toast.success('Password reset email sent! Check your inbox.');
        } catch (error) {
            console.error('Error sending reset email:', error);
            toast.error('Failed to send password reset email');
        }
    };

    if (loading) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container fluid style={{ padding: '0 24px', maxWidth: '100%' }}>
            <div className="hk-pg-header pt-7 pb-4">
                <h1 className="pg-title">Edit Profile</h1>
                <p className="text-muted">Update your personal information and preferences.</p>
            </div>

            <div className="hk-pg-body">
                <Tab.Container defaultActiveKey="tabBlock1">
                    <Row className="edit-profile-wrap">
                        <Col xs={4} sm={3} lg={2}>
                            <div className="nav-profile mt-4">
                                <div className="nav-header">
                                    <span>Account</span>
                                </div>
                                <Nav as="ul" variant="tabs" className="nav-light nav-vertical">
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="tabBlock1">
                                            <span className="nav-link-text">Public Profile</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="tabBlock2">
                                            <span className="nav-link-text">Account Settings</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="tabBlock3">
                                            <span className="nav-link-text">Privacy Settings</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="tabBlock4">
                                            <span className="nav-link-text">Login &amp; Security</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </div>
                        </Col>

                        <Col lg={10} sm={9} xs={8}>
                            <Tab.Content>
                                {/* Public Profile Tab */}
                                <Tab.Pane eventKey="tabBlock1">
                                    <Form onSubmit={handleSaveProfile}>
                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Group>
                                                    <div className="media align-items-center">
                                                        <div className="media-head me-5">
                                                            <div
                                                                className="avatar avatar-rounded avatar-xxl position-relative"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={handleAvatarClick}
                                                            >
                                                                <img
                                                                    src={avatarPreview || defaultAvatar}
                                                                    alt="user"
                                                                    className="avatar-img"
                                                                    style={{
                                                                        objectFit: 'cover',
                                                                        objectPosition: 'center',
                                                                        width: '100%',
                                                                        height: '100%'
                                                                    }}
                                                                    onError={(e) => { e.target.src = defaultAvatar; }}
                                                                />
                                                                <div
                                                                    className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                                                    style={{ width: '32px', height: '32px', border: '2px solid white' }}
                                                                >
                                                                    {uploadingAvatar ? (
                                                                        <Spinner animation="border" size="sm" variant="light" />
                                                                    ) : (
                                                                        <Camera size={16} color="white" weight="fill" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="media-body">
                                                            <Button
                                                                variant="soft-primary"
                                                                className="btn-file mb-1"
                                                                onClick={handleAvatarClick}
                                                                disabled={uploadingAvatar}
                                                            >
                                                                {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                                                            </Button>
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleAvatarChange}
                                                                style={{ display: 'none' }}
                                                            />
                                                            <Form.Text as="div" className="form-text text-muted">
                                                                Recommended size: 450px x 450px. Max size: 5MB.
                                                            </Form.Text>
                                                        </div>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                                            <span>Personal Info</span>
                                        </div>

                                        <Row className="gx-3">
                                            <Col sm={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>First Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your first name"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Last Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your last name"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="gx-3">
                                            <Col sm={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Company</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="company"
                                                        value={formData.company}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your company name"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Role</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="role"
                                                        value={formData.role}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., Manager, Admin"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Location</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="location"
                                                        value={formData.location}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., San Francisco, CA"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Group className="mb-3">
                                                    <div className="form-label-group">
                                                        <Form.Label>Bio</Form.Label>
                                                        <small className="text-muted">{formData.bio.length}/1200</small>
                                                    </div>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={6}
                                                        name="bio"
                                                        value={formData.bio}
                                                        onChange={handleInputChange}
                                                        placeholder="Tell us about yourself..."
                                                        maxLength={1200}
                                                    />
                                                    <Form.Text muted>
                                                        Brief bio about yourself. This will be displayed on your profile page.
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                                            <span>Additional Info</span>
                                        </div>

                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Personal Website</Form.Label>
                                                    <Form.Control
                                                        type="url"
                                                        name="website"
                                                        value={formData.website}
                                                        onChange={handleInputChange}
                                                        placeholder="https://yourwebsite.com"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Phone</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="+1 234 567 8900"
                                                    />
                                                </Form.Group>
                                                <Form.Check
                                                    type="checkbox"
                                                    id="phonePrivate"
                                                    name="phone_private"
                                                    label="Keep my phone number private"
                                                    checked={formData.phone_private}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        </Row>

                                        <div className="d-flex gap-2 mt-5">
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="me-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={18} className="me-1" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                as={Link}
                                                to="/profile"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </Form>
                                </Tab.Pane>

                                {/* Account Settings Tab */}
                                <Tab.Pane eventKey="tabBlock2">
                                    <div className="title-lg fs-4"><span>Account Settings</span></div>
                                    <p className="mb-4 text-muted">Manage your account email and username.</p>
                                    <Form>
                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Email Address</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        value={formData.email}
                                                        disabled
                                                        className="bg-light"
                                                    />
                                                    <Form.Text muted>
                                                        Email cannot be changed. Contact support if you need to update it.
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>User ID</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={user?.id || ''}
                                                        disabled
                                                        className="bg-light font-monospace"
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="title title-xs title-wth-divider text-danger text-uppercase my-4">
                                            <span>Danger Zone</span>
                                        </div>

                                        <Alert variant="light" className="border-danger">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <h6 className="mb-1 text-danger">Delete Account</h6>
                                                    <small className="text-muted">
                                                        Permanently delete your account and all associated data.
                                                    </small>
                                                </div>
                                                <Button variant="outline-danger" size="sm">
                                                    Delete Account
                                                </Button>
                                            </div>
                                        </Alert>
                                    </Form>
                                </Tab.Pane>

                                {/* Privacy Settings Tab */}
                                <Tab.Pane eventKey="tabBlock3">
                                    <div className="title-lg fs-4 mb-4">
                                        <span>Privacy Settings</span>
                                    </div>
                                    <Form>
                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Check className="form-check-lg mb-3">
                                                    <Form.Check.Input
                                                        id="findByEmail"
                                                        name="phone_private"
                                                        checked={formData.phone_private}
                                                        onChange={handleInputChange}
                                                    />
                                                    <Form.Check.Label htmlFor="findByEmail">
                                                        Keep my phone number private
                                                    </Form.Check.Label>
                                                    <Form.Text muted className="d-block">
                                                        No one can find you by your phone number. Your phone number will not be shared.
                                                    </Form.Text>
                                                </Form.Check>
                                                <div className="separator my-3" />
                                                <Form.Check className="form-check-lg mb-3">
                                                    <Form.Check.Input id="shareLocation" />
                                                    <Form.Check.Label htmlFor="shareLocation">
                                                        Show my location on profile
                                                    </Form.Check.Label>
                                                    <Form.Text muted className="d-block">
                                                        Your location will be visible on your public profile.
                                                    </Form.Text>
                                                </Form.Check>
                                            </Col>
                                        </Row>
                                        <Button variant="primary" className="mt-4">Save Privacy Settings</Button>
                                    </Form>
                                </Tab.Pane>

                                {/* Login & Security Tab */}
                                <Tab.Pane eventKey="tabBlock4">
                                    <div className="title-lg fs-4"><span>Login &amp; Security</span></div>
                                    <p className="mb-4 text-muted">Manage your password and security settings.</p>
                                    <Form>
                                        <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                                            <span>Password Settings</span>
                                        </div>
                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Group>
                                                    <Form.Label>Change Password</Form.Label>
                                                    <Form.Text muted className="d-block mb-3">
                                                        A password reset link will be sent to your email: <strong>{formData.email}</strong>
                                                    </Form.Text>
                                                    <Button variant="primary" onClick={handlePasswordChange}>
                                                        Send Password Reset Email
                                                    </Button>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                                            <span>Authentication Provider</span>
                                        </div>
                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                                                    <div className="avatar avatar-sm avatar-primary avatar-rounded">
                                                        <span className="initial-wrap">
                                                            {user?.app_metadata?.provider?.charAt(0).toUpperCase() || 'E'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="mb-0 fw-medium text-capitalize">
                                                            {user?.app_metadata?.provider || 'Email'} Authentication
                                                        </p>
                                                        <small className="text-muted">
                                                            Last sign in: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </Container>
    );
};

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed };
};

export default connect(mapStateToProps, { toggleCollapsedNav })(EditProfile);
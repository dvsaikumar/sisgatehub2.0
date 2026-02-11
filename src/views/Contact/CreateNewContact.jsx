import React, { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import toast from 'react-hot-toast';
import HkDropZone from '../../components/@hk-drop-zone/HkDropZone';
import HkTags from '../../components/@hk-tags/@hk-tags';
import { contactSchema } from '../../lib/schemas';

const CreateNewContact = ({ show, close }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        country: '',
        company: '',
        designation: '',
        website: '',
        workPhone: '',
        facebook: '',
        twitter: '',
        linkedin: '',
        gmail: '',
        biography: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        const validation = contactSchema.safeParse(formData);
        if (!validation.success) {
            const errorMsg = validation.error.issues[0].message;
            toast.error(errorMsg);
            return;
        }

        // Proceed to save (Mock logic for now as backend integration wasn't requested)
        toast.success('Validation passed! Contact creation logic would run here.');
        close();
    };

    const Tags = [];

    return (
        <Modal show={show} onHide={close} centered size="lg" className="add-new-contact" >
            <Modal.Body>
                <Button bsPrefix="btn-close" onClick={close}>
                    <span aria-hidden="true">×</span>
                </Button>
                <h5 className="mb-5">Create New Contact</h5>
                <Form>
                    <Row className="gx-3">
                        <Col sm={2} as={Form.Group} className="mb-3" >
                            <HkDropZone className="dropify-square">
                                Upload Photo
                            </HkDropZone>
                        </Col>
                        <Col sm={10} as={Form.Group}>
                            <Form.Control
                                as="textarea"
                                className="mnh-100p"
                                rows={4}
                                placeholder="Add Biography"
                                name="biography"
                                value={formData.biography}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>
                    <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                        <span>Basic Info</span>
                    </div>
                    <Row className="gx-3">
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Middle Name</Form.Label>
                                <Form.Control type="text" name="middleName" value={formData.middleName} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="gx-3">
                        <div className="col-sm-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Email ID</Form.Label>
                                <Form.Control type="text" name="email" value={formData.email} onChange={handleChange} />
                            </Form.Group>
                        </div>
                        <div className="col-sm-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                            </Form.Group>
                        </div>
                    </Row>
                    <Row className="gx-3">
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>City</Form.Label>
                                <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>State</Form.Label>
                                <Form.Control type="text" name="state" value={formData.state} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col sm={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Country</Form.Label>
                                <Form.Control type="text" name="country" value={formData.country} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="title title-xs title-wth-divider text-primary text-uppercase my-4"><span>Company Info</span></div>
                    <Row className="gx-3">
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Company Name</Form.Label>
                                <Form.Control type="text" name="company" value={formData.company} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Designation</Form.Label>
                                <Form.Control type="text" name="designation" value={formData.designation} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Website</Form.Label>
                                <Form.Control type="text" name="website" value={formData.website} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Work Phone</Form.Label>
                                <Form.Control type="text" name="workPhone" value={formData.workPhone} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="title title-xs title-wth-divider text-primary text-uppercase my-4"><span>Additional Info</span></div>
                    <Row className="gx-3">
                        <div className="col-sm-12">
                            <Form.Group className="mb-3">
                                <Form.Label>Tags</Form.Label>
                                <HkTags
                                    options={Tags}
                                />
                                <small className="form-text text-muted">
                                    You can add upto 4 tags per contact
                                </small>
                            </Form.Group>
                        </div>
                    </Row>
                    <Row className="gx-3">
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" placeholder="Facebook" name="facebook" value={formData.facebook} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" placeholder="Twitter" name="twitter" value={formData.twitter} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" placeholder="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" placeholder="Gmail" name="gmail" value={formData.gmail} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="align-items-center">
                <Button variant="secondary" onClick={close}>Discard</Button>
                <Button variant="primary" onClick={handleSubmit}>Create Contact</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default CreateNewContact;

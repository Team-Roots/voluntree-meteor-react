import React from 'react';
import { Container, Col, Row, Image, Card, Button, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const RegistrationCard = ({ event }) => (
  <Container>
    <Row className="justify-content-center align-items-center my-5">
      <Col md={4} className="p-0">
        <Image className="img-fluid w-100 h-100" src="https://static.wikia.nocookie.net/aesthetics/images/0/0e/Green.jpg/revision/latest?cb=20200723215419" />
      </Col>
      <Col md={8}>
        <Card className="mt-5">
          <Card.Header className="bg-transparent border-0 text-center">
            <h1>{event.name}</h1>
          </Card.Header>
          <Card.Body className="text-end">
            <Button as={Link} to="/registrationform" variant="danger" size="lg" className="mb-3">
              I Want to Help
            </Button>
            <ListGroup variant="flush" className="text-start">
              <ListGroup.Item><strong>ORGANIZATION: </strong>{event.coordinator}</ListGroup.Item>
              <ListGroup.Item><strong>EVENT AREAS: </strong>{event.location}</ListGroup.Item>
              <ListGroup.Item><strong>START TIME: </strong>{event.startTime}</ListGroup.Item>
              <ListGroup.Item><strong>END TIME: </strong>{event.endTime}</ListGroup.Item>
              <ListGroup.Item><strong>WHERE: </strong>{event.location}</ListGroup.Item>
              <ListGroup.Item><strong>DESCRIPTION: </strong>{event.description}</ListGroup.Item>
              <ListGroup.Item><strong>VOLUNTEERS NEEDED: </strong>{event.amountVolunteersNeeded}</ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

RegistrationCard.propTypes = {
  event: PropTypes.shape({
    name: PropTypes.string,
    eventDate: PropTypes.instanceOf(Date),
    description: PropTypes.string,
    location: PropTypes.string,
    coordinator: PropTypes.string,
    image: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    amountVolunteersNeeded: PropTypes.number,
    owner: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
};

export default RegistrationCard;

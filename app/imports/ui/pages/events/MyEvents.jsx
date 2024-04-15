import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Container, Row, Col, FormCheck } from 'react-bootstrap';
import FormCheckInput from 'react-bootstrap/FormCheckInput';
import FormCheckLabel from 'react-bootstrap/FormCheckLabel';
import { useTracker } from 'meteor/react-meteor-data';
import { Events } from '../../../api/event/EventCollection';
import EventCard from '../../components/EventCard';
import { PAGE_IDS } from '../../utilities/PageIDs';
import { EventCategories } from '../../../api/event/EventCategoriesCollection';

const MyEvents = () => {
  const user = Meteor.user();
  const creator = user ? user.username : null;

  const { ready, events, eventCategories } = useTracker(() => {
    const subscription = Events.subscribeEvent();
    const subscription2 = EventCategories.subscribeEventCategories();
    const rdy = subscription.ready() && subscription2.ready();
    const eventItems = Events.find({}, { sort: { name: 1 } }).fetch();
    if (!subscription.ready() && !subscription2.ready()) {
      console.log('Subscription is not ready yet.');
    } else {
      console.log('Subscription is ready.');
    }

    const eventCategoriesItems = EventCategories.find({}, { sort: { eventInfo: 1 } }).fetch();
    return {
      events: eventItems,
      eventCategories: eventCategoriesItems,
      ready: rdy,
    };
  }, []);
  if (!ready) {
    return (
      <Container id={PAGE_IDS.LIST_EVENT} className="py-3">
        <Row className="justify-content-center">
          <Col md={8}>
            <div>Loading Events...</div>
          </Col>
        </Row>
      </Container>
    );
  }

  const myEventsList = events.filter((event) => event.creator === creator);

  return (
    <Container className="py-3" id={PAGE_IDS.LIST_EVENT}>
      <Row>
        <Col lg={2}>
          <h3 className="poppinsText">Filter By</h3>
          <h4 className="poppinsText">Location</h4>
          <FormCheck>
            <FormCheckInput type="radio" />
            <FormCheckLabel className="robotoText">Honolulu, HI</FormCheckLabel>
          </FormCheck>
          <FormCheck>
            <FormCheckInput type="radio" />
            <FormCheckLabel className="robotoText">Pearl City, HI</FormCheckLabel>
          </FormCheck>
          <FormCheck>
            <FormCheckInput type="radio" />
            <FormCheckLabel className="robotoText">Waimanalo, HI</FormCheckLabel>
          </FormCheck>
          <h4 className="poppinsText">Location Type</h4>
          <FormCheck>
            <FormCheckInput type="checkbox" />
            <FormCheckLabel className="robotoText">Indoors</FormCheckLabel>
          </FormCheck>
          <FormCheck>
            <FormCheckInput type="checkbox" />
            <FormCheckLabel className="robotoText">Outdoors</FormCheckLabel>
          </FormCheck>
          <FormCheck>
            <FormCheckInput type="checkbox" />
            <FormCheckLabel className="robotoText">Online</FormCheckLabel>
          </FormCheck>
          <h4 className="poppinsText">Category</h4>
          <FormCheck>
            <FormCheckInput type="checkbox" />
            <FormCheckLabel className="robotoText">Animal Shelter</FormCheckLabel>
          </FormCheck>
          <FormCheck>
            <FormCheckInput type="checkbox" />
            <FormCheckLabel className="robotoText">Clean Up</FormCheckLabel>
          </FormCheck>
          <FormCheck>
            <FormCheckInput type="checkbox" />
            <FormCheckLabel className="robotoText">Food Distribution</FormCheckLabel>
          </FormCheck>
          <br />
          <FormCheck>
            <FormCheckInput type="checkbox" />
            <FormCheckLabel>
              <h5 className="poppinsText">Need Background Check</h5>
            </FormCheckLabel>
          </FormCheck>
        </Col>
        <Col>
          <Row xs={1} md={2} lg={3} className="g-4">
            {myEventsList.map((event) => (
              <Col key={event._id}>
                <EventCard
                  event={event}
                  eventCategory={eventCategories.find(eventCategory => (
                    eventCategory.eventInfo.eventName === event.name &&
                    eventCategory.eventInfo.organizationID === event.organizationID
                    // TODO: fix eventDates, some reason its not working
                    // && eventCategory.eventInfo.eventDate === event.eventDate
                  ))}
                />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default MyEvents;
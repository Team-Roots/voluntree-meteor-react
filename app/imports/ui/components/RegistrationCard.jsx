import React, { useState } from 'react';
import { Container, Col, Row, Image, Card, Button, ListGroup } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link, useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import Spinner from 'react-bootstrap/Spinner';
import { EventSubscription } from '../../api/event/EventSubscriptionCollection';
import { Organizations } from '../../api/organization/OrganizationCollection';
import { UserStats } from '../../api/user/UserStatisticsCollection';

const RegistrationCard = ({ event }) => {
  const [volunteersNeeded, setVolunteersNeeded] = useState(event.amountVolunteersNeeded);
  const formattedCalendarDate = event.eventDate ? event.eventDate.toISOString().slice(0, 10)
    : 'Date not set';
  const owner = Meteor.user().username;

  const { ready, canSubscribe, eventOrganization, foundStats, foundEventStat } = useTracker(() => {
    const eventSubscription = EventSubscription.subscribeEvent();
    const organizationSubscription = Organizations.subscribeOrg();
    const userStatsSubscription = UserStats.subscribeStats();
    const rdy = eventSubscription.ready() && organizationSubscription.ready() && userStatsSubscription.ready();
    if (!rdy) {
      console.log('Subscription is not ready yet.');
    } else {
      console.log('Subscription is ready.');
    }
    const subscribeBy = Meteor.user().username;
    const eventSubscriptionInfo = {};
    eventSubscriptionInfo.email = subscribeBy;
    eventSubscriptionInfo.orgID = event.organizationID;
    eventSubscriptionInfo.eventName = event.name;
    eventSubscriptionInfo.eventDate = formattedCalendarDate;
    const foundEventOrganization = Organizations.findOne({ orgID: event.organizationID }, {});
    const subscriptionExists = EventSubscription.findOne({ subscriptionInfo: eventSubscriptionInfo });
    const foundUserStats = UserStats.findOne({ email: subscribeBy });
    // $elemMatch is a query operator that allows matching documents that contain an array field with at least one element that matches all the specified query criteria.
    const foundEventStatistic = UserStats.findOne({
      'stats.orgsHelped': {
        $elemMatch: {
          // orgName: orgName, find a way to do this please
          eventName: event.name,
          eventDate: formattedCalendarDate,
        },
      },
    });
    return {
      eventOrganization: foundEventOrganization,
      canSubscribe: !(subscriptionExists),
      foundStats: !!(foundUserStats),
      foundEventStat: !!(foundEventStatistic),
      ready: rdy,
    };
  }, []);

  const formattedDate = event.eventDate ? event.eventDate.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : 'Date not set';
  const navigate = useNavigate();
  const subscribeEvent = () => {
    // email
    const subscribeBy = Meteor.user().username;
    const eventSubscriptionInfo = {};
    eventSubscriptionInfo.email = subscribeBy;
    eventSubscriptionInfo.orgID = event.organizationID;
    eventSubscriptionInfo.eventName = event.name;
    eventSubscriptionInfo.eventDate = formattedCalendarDate;
    if (canSubscribe) {
      Meteor.call('eventSubscription.insert', eventSubscriptionInfo, (error) => {
        if (error) {
          console.error('Error inserting event subscription:', error.reason);
        } else {
          console.log('Event subscription inserted successfully.');
        }
      });
    } else {
      Meteor.call('eventSubscription.unsub', eventSubscriptionInfo, (error) => {
        if (error) {
          console.error('Error inserting event subscription:', error.reason);
        } else {
          console.log('Event subscription deleted successfully.');
        }
      });
    }
  };

  const ClaimHours = () => {
    const subscribeBy = Meteor.user().username;
    const eventInfo = {};
    eventInfo.email = subscribeBy;
    eventInfo.orgID = event.organizationID;
    eventInfo.eventName = event.name;
    eventInfo.eventDate = formattedCalendarDate;
    eventInfo.hoursServed = 2;

    Meteor.call('userStats.updateOrgsHelpedData', eventInfo, (error) => {
      if (error) {
        console.error('Error inserting userStats.updateOrgsHelpedData subscription:', error.reason);
      } else {
        console.log('Event userStats.updateOrgsHelpedData ran successfully.');
        setVolunteersNeeded(volunteersNeeded - 1);
      }
    });
  };

  const openGoogleMaps = (address) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  return (ready ? (
    <Container>
      <Row className="mb-3 button-small-fixed-size">
        <Button as={Link} onClick={() => navigate(-1)} variant="danger" size="sm">
          Return
        </Button>
      </Row>
      <Row className="justify-content-center align-items-center">
        <Col md={4} className="p-0">
          <Image className="img-fluid w-100 h-100" src={event.image} />
        </Col>
        <Col md={8}>
          <Card>
            <Card.Header className="bg-transparent border-0 text-center">
              <h1>{event.name}</h1>
            </Card.Header>
            <Card.Body className="text-end">
              <Tooltip title="If you have attended the event, claim your volunteer hours here." placement="bottom">
                <Button
                  variant={(foundStats && !canSubscribe) ? 'success' : 'danger'}
                  size="lg"
                  className="mb-3 mx-2"
                  disabled={(!(foundStats && !canSubscribe) || foundEventStat)}
                  onClick={ClaimHours}
                >
                  {!foundEventStat ? 'Claim Hours' : 'Hours claimed'}
                </Button>
              </Tooltip>
              <Tooltip title="Reserve a volunteer spot to this event." placement="bottom">
                <Button
                  variant={canSubscribe ? 'success' : 'danger'}
                  size="lg"
                  className="mb-3 mx-2"
                  onClick={subscribeEvent}
                >
                  {canSubscribe ? 'Subscribe' : 'Unsubscribe'}
                </Button>
              </Tooltip>
              <Tooltip title="Chat with the organizer." placement="bottom">
                <Button
                  as={Link}
                  to={{
                    pathname: `/comment/${event._id}`,
                    state: { owner: owner }, // Pass additional state here
                  }}
                  variant="danger"
                  size="lg"
                  className="mb-3 mx-2"
                >
                  Chat
                </Button>
              </Tooltip>
              <ListGroup variant="flush" className="text-start">
                <ListGroup.Item>
                  <strong>EVENT LOCATION: </strong>
                  <Tooltip title="View in Google Maps." placement="bottom">
                    <container style={{ color: 'rgba(var(--bs-link-color-rgb)' }} onClick={() => openGoogleMaps(event.location)}>
                      {event.location}
                    </container>
                  </Tooltip>
                </ListGroup.Item>
                <ListGroup.Item><strong>DATE: </strong>{formattedDate}</ListGroup.Item>
                <ListGroup.Item><strong>START TIME: </strong>{event.startTime}</ListGroup.Item>
                <ListGroup.Item><strong>END TIME: </strong>{event.endTime}</ListGroup.Item>
                <ListGroup.Item><strong>DESCRIPTION: </strong>{event.description}</ListGroup.Item>
                <ListGroup.Item><strong>COORDINATOR: </strong>{event.coordinator}</ListGroup.Item>
                <ListGroup.Item><strong>ORGANIZATION: </strong><a href={`/organizations/${event.organizationID}`}>{eventOrganization.name}</a></ListGroup.Item>
                <ListGroup.Item><strong>VOLUNTEERS NEEDED: </strong>{volunteersNeeded}</ListGroup.Item>
                {event.specialInstructions && <ListGroup.Item><strong>SPECIAL INSTRUCTIONS: </strong>{event.specialInstructions}</ListGroup.Item>}
                {/* {event.restrictions && <ListGroup.Item><strong>RESTRICTIONS: </strong>{event.restrictions}</ListGroup.Item>}
                {event.ageRange && <ListGroup.Item><strong>AGE RANGE: </strong>{event.ageRange}</ListGroup.Item>} */}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  ) : (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spinner animation="grow" />
    </div>
  )
  );
};

RegistrationCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    eventDate: PropTypes.instanceOf(Date),
    description: PropTypes.string,
    category: PropTypes.string,
    location: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    coordinator: PropTypes.string,
    amountVolunteersNeeded: PropTypes.number,
    isOnline: PropTypes.bool,
    image: PropTypes.string,
    specialInstructions: PropTypes.string,
    // figure out what the data type of restrictions and ageRange are
    // restrictions
    // ageRange
    organizationID: PropTypes.string,
    creator: PropTypes.string,
    owner: PropTypes.string,
  }).isRequired,
};

export default RegistrationCard;

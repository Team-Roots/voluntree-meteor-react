import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Container } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import LandingPanels from '../components/LandingPanels';
import { PAGE_IDS } from '../utilities/PageIDs';
import { Organizations } from '../../api/organization/OrganizationCollection';
import AboutUs from './AboutUs';
import { Events } from '../../api/event/EventCollection';
import { EventSubscription } from '../../api/event/EventSubscriptionCollection';
import { UserStats } from '../../api/user/UserStatisticsCollection';
import { EventCategories } from '../../api/event/EventCategoriesCollection';

const Landing = () => {
  const { ready, subscribedEvents, orgs, events, stat, eventCategories } = useTracker(() => {
    const subscription = Organizations.subscribeOrg();
    const rdy = subscription.ready();
    if (!subscription.ready()) {
      console.log('Subscription1 is not ready yet.');
    } else {
      console.log('Subscription1 is ready.');
    }
    const orgItems = Organizations.find({}, { sort: { name: 1 } }).fetch();
    const subscription2 = Events.subscribeEvent();
    const rdy2 = subscription2.ready();
    if (!subscription2.ready()) {
      console.log('Subscription 2 is not ready yet.');
    } else {
      console.log('Subscription 2 is ready.');
    }
    const eventItems = Events.find({}, { sort: { eventDate: 1 } }).fetch();

    const subscription3 = EventSubscription.subscribeEvent();
    const rdy3 = subscription3.ready();
    if (!subscription3.ready()) {
      console.log('Subscription 3 is not ready yet.');
    } else {
      console.log('Subscription 3 is ready.');
    }
    const eventSubscription = EventSubscription.find({}, { sort: { subscriptionInfo: 1 } }).fetch();

    const subscription4 = UserStats.subscribeStats();
    const rdy4 = subscription4.ready();
    if (!subscription4.ready()) {
      console.log('subscription4 is not ready yet.');
    } else {
      console.log('subscription4 is ready.');
    }
    const currentUserEmail = Meteor.user() ? Meteor.user().emails[0].address : '';
    const stats = UserStats.findOne({}, { email: currentUserEmail });
    console.log(stats);

    const subscription5 = EventCategories.subscribeEventCategories();
    const rdy5 = subscription5.ready();
    const eventCategoriesItems = EventCategories.find({}, { sort: { eventInfo: 1 } }).fetch();
    console.log(eventSubscription);
    return {
      events: eventItems,
      subscribedEvents: eventSubscription,
      orgs: orgItems,
      stat: stats,
      eventCategories: eventCategoriesItems,
      ready: rdy && rdy2 && rdy3 && rdy4 && rdy5,
    };
  }, []);
  // const currentDate = new Date();
  // const filteredDate = events.filter((event) => event.eventDate >= currentDate);
  // console.log(Meteor.user().emails[0].address);
  const loggedin = Meteor.user();
  if (loggedin) {
    return (ready ? (
      <Container id={PAGE_IDS.LANDING}>
        <LandingPanels orgs={orgs} events={events} subbedEvents={subscribedEvents} stat={stat} eventCategories={eventCategories} />
      </Container>
    ) : (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner animation="grow" />
      </div>
    )
    );
  }
  return (ready ? (
    <AboutUs id={PAGE_IDS.LANDING} />
  ) : (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spinner animation="grow" />
    </div>
  )
  );
};

export default Landing;

import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Button, Card, Col, Container, Nav, Row } from 'react-bootstrap';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { Roles } from 'meteor/alanning:roles';
import { PAGE_IDS } from '../../utilities/PageIDs';
import { Organizations } from '../../../api/organization/OrganizationCollection';
import { ROLE } from '../../../api/role/Role';
import NotAuthorized from '../NotAuthorized';
import NotFound from '../NotFound';
import LoadingSpinner from '../../components/LoadingSpinner';
import { OrganizationAdmin } from '../../../api/organization/OrganizationAdmin';
import Details from '../../components/organizations/edit-tabs/EditDetails';
import EditAdmins from '../../components/organizations/edit-tabs/EditAdmins';
import EditGeneral from '../../components/organizations/edit-tabs/EditGeneral';

const EditOrganization = () => {
  const currentUser = useTracker(() => Meteor.user());
  const { orgID } = useParams();
  const parsedOrgID = parseInt(orgID, 10);
  const { thisOrganization, allowedToEdit, ready } = useTracker(() => {
    const orgSubscription = Organizations.subscribeOrg();
    const orgAdminSubscription = OrganizationAdmin.subscribeOrgAdmin();
    const rdy = orgSubscription.ready() && orgAdminSubscription.ready();
    const foundOrganization = Organizations.findOne({ orgID: parsedOrgID }, {});
    const foundOrganizationAdmin = OrganizationAdmin.findOne({ orgAdmin: currentUser?.username, orgID: parsedOrgID }, {});
    const hasOrgAdminRole = Roles.userIsInRole(currentUser?._id, [ROLE.ORG_ADMIN]);
    return {
      thisOrganization: foundOrganization,
      allowedToEdit: hasOrgAdminRole && !!foundOrganizationAdmin,
      ready: rdy,
    };
  }, [orgID]);
  const [tab, setTab] = useState('general');
  if (ready) {
    let mainContent;
    switch (tab) {
    case 'details':
      mainContent = <Details />;
      break;
    case 'admins':
      mainContent = <EditAdmins />;
      break;
    default:
      mainContent = <EditGeneral organization={thisOrganization} />;
      break;
    }
    if (!allowedToEdit) {
      return <NotAuthorized />;
    }
    if (!thisOrganization) {
      return <NotFound />;
    }
    return (
      <Container id={PAGE_IDS.EDIT_ORGANIZATION} className="py-3">
        <Row className="justify-content-center">
          <Col xs={2}>
            <Nav
              className="flex-column"
              variant="underline"
              defaultActiveKey="general"
              onSelect={eventKey => setTab(eventKey)}
            >
              <Nav.Link
                eventKey="general"
              >
                General
              </Nav.Link>
              <Nav.Link eventKey="details">Details</Nav.Link>
              <Nav.Link eventKey="admins">Admins</Nav.Link>
            </Nav>
          </Col>
          <Col xs={8}>
            {mainContent}
          </Col>
        </Row>
      </Container>
    );
  }
  return <LoadingSpinner />;
};

export default EditOrganization;

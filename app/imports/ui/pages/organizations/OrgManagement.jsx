import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { useTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import { ROLE } from '../../../api/role/Role';
import NotAuthorized from '../NotAuthorized';
import { Organizations } from '../../../api/organization/OrganizationCollection';
import LoadingSpinner from '../../components/LoadingSpinner';
import { OrganizationAdmin } from '../../../api/organization/OrganizationAdmin';
import EditOrgGear from '../../components/organizations/EditOrgGear';

const OrgManagement = () => {
  const currentUser = useTracker(() => Meteor.user());
  const { userIsAdminOrganizations, ownedOrganization, ownedOrganizationAdmins, ready } = useTracker(() => {
    const organizationSubscription = Organizations.subscribeOrg();
    const organizationAdminSubscription = OrganizationAdmin.subscribeOrgAdmin();
    // Determine if the subscription is ready
    const rdy = organizationSubscription.ready() && organizationAdminSubscription.ready();
    const foundOwnedOrganization = Organizations.findOne({ organizationOwner: currentUser?.username }, {});
    const foundOwnedOrganizationAdmins = OrganizationAdmin.find({ orgID: foundOwnedOrganization?.orgID }, {}).fetch(); // subscribe to the organizationAdmin documents that the user is an admin of or the user owns the organization
    // array of objects {
    //   orgAdmin
    //   orgID
    // }
    const foundUserIsAdminOrganizationIDs = _.pluck(OrganizationAdmin.find({ orgAdmin: currentUser?.username }, {}).fetch(), 'orgID');
    const foundUserIsAdminOrganizations = Organizations.find({
      orgID: { $in: foundUserIsAdminOrganizationIDs },
    }, {}).fetch().filter(org => org?.orgID !== foundOwnedOrganization?.orgID); // query only for the organizations that the user is an admin of
    return {
      userIsAdminOrganizations: foundUserIsAdminOrganizations,
      ownedOrganization: foundOwnedOrganization,
      ownedOrganizationAdmins: foundOwnedOrganizationAdmins,
      ready: rdy,
    };
  }, []);
  if (Roles.userIsInRole(Meteor.userId(), [ROLE.ORG_ADMIN])) {
    return ready ? (
      <Container className="py-3">
        <Row className="d-flex justify-content-center">
          <Col xs={10}>
            {ownedOrganization || userIsAdminOrganizations.length ? (
              <>
                {ownedOrganization ? (
                  <>
                    <h1>Your organization</h1>
                    <Card>
                      <Card.Body>
                        <Card.Title className="d-flex justify-content-between">
                          <Link to={`/organizations/${ownedOrganization.orgID}`}>{ownedOrganization.name}</Link>
                          <EditOrgGear orgID={ownedOrganization.orgID} />
                        </Card.Title>
                        <Card.Text>Admins: {ownedOrganizationAdmins.length - 1}</Card.Text>
                      </Card.Body>
                    </Card>
                  </>
                ) : ''}
                {userIsAdminOrganizations.length ? (
                  <>
                    <h3>Organizations you are a part of</h3>
                    {userIsAdminOrganizations.map(organization => (<Link to={`/organizations/${organization.orgID}`}>{organization.name}</Link>))}
                    {
                      // TODO: make this look better
                    }
                  </>
                ) : ''}
              </>
            ) : (
              <p>You are not part of any organization</p>
            )}
          </Col>
        </Row>
      </Container>
    ) : (
      <LoadingSpinner />
    );
  }
  return <NotAuthorized />;
};

export default OrgManagement;

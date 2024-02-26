import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { NavLink } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { BoxArrowRight, CloudDownload, PersonFill, PersonPlusFill } from 'react-bootstrap-icons';
import { ROLE } from '../../api/role/Role';
import { COMPONENT_IDS } from '../utilities/ComponentIDs';

const NavBar = () => {
  const { currentUser } = useTracker(() => ({
    currentUser: Meteor.user() ? Meteor.user().username : '',
  }), []);
  const menuStyle = { marginBottom: '10px' };

  return (
    <Navbar expand="md" style={{ ...menuStyle, backgroundColor: '#02B5A6' }}>
      <img src="/images/Voluntree.logo-noG.png" alt="Bootstrap" width="160" height="112" />

      <Container>
        <Navbar.Brand className="navbar-brand-link poppinsText " id={COMPONENT_IDS.NAVBAR_LANDING_PAGE} as={NavLink} to="/"><h1>VolunTree</h1></Navbar.Brand>
        <Navbar.Toggle aria-controls={COMPONENT_IDS.NAVBAR_COLLAPSE} />
        <Navbar.Collapse id={COMPONENT_IDS.NAVBAR_COLLAPSE}>
          <Nav className="me-auto justify-content-end robotoText">
            {!currentUser && (
              <>
                <Nav.Link className="navbar-link" id={COMPONENT_IDS.NAVBAR_LANDING_PAGE} as={NavLink} to="/">Home</Nav.Link>
                <Nav.Link className="navbar-link" id={COMPONENT_IDS.NAVBAR_LIST_EVENTS} as={NavLink} to="/aboutus">About Us</Nav.Link>
                <Nav.Link className="navbar-link" id={COMPONENT_IDS.NAVBAR_LIST_EVENTS} as={NavLink} to="/events">Events</Nav.Link>
                <Nav.Link className="navbar-link" id={COMPONENT_IDS.NAVBAR_LIST_EVENTS} as={NavLink} to="/communitygroups">Community Groups</Nav.Link>
                <Nav.Link className="navbar-link" id={COMPONENT_IDS.NAVBAR_FAQ} as={NavLink} to="/faq">FAQ</Nav.Link>

                <NavDropdown className="navbar-dropdown" id="login-dropdown" title="Help">
                  <NavDropdown.Item id="login-dropdown-sign-in" as={NavLink} to="/questions" />
                  <NavDropdown.Item id="login-dropdown-sign-up" as={NavLink} to="/contactus">
                    Contact Us
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
            {currentUser ? ([
              <Nav.Link className="navbar-link" id={COMPONENT_IDS.NAVBAR_ABOUT_US} as={NavLink} to="/aboutus">About Us</Nav.Link>,
              <NavDropdown className="navbar-link" id={COMPONENT_IDS.NAVBAR_GIVE_HELP_DROPDOWN} title="Explore">
                <NavDropdown.Item id={COMPONENT_IDS.NAVBAR_LIST_EVENTS} as={NavLink} to="/events" key="events">Events</NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/opportunities" key="opportunities">Opportunities</NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/organizations" key="organizations">Organizations</NavDropdown.Item>
                {
                  // TODO: goes to notfound until opportunities is implemented
                }
              </NavDropdown>,
              <Nav.Link className="navbar-link" id={COMPONENT_IDS.NAVBAR_COMMUNITY_GROUPS} as={NavLink} to="/communitygroups">Community Groups</Nav.Link>,
              <NavDropdown className="navbar-link" id={COMPONENT_IDS.NAVBAR_MY_ACCOUNT_DROPDOWN} title="My Account">
                <NavDropdown.Item id={COMPONENT_IDS.NAVBAR_MY_ACCOUNT} as={NavLink} to="/myaccount" key="list">Profile</NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/my-events" key="my-events">My Events</NavDropdown.Item>
              </NavDropdown>,
              <NavDropdown className="navbar-link" id={COMPONENT_IDS.NAVBAR_HELP_DROPDOWN} title="Help">
                <NavDropdown.Item id={COMPONENT_IDS.NAVBAR_FAQ} as={NavLink} key="faq" to="/faq">
                  FAQ
                </NavDropdown.Item>
                <NavDropdown.Item id={COMPONENT_IDS.NAVBAR_CONTACT_US} as={NavLink} key="contact-us" to="/contactus">
                  Contact Us
                </NavDropdown.Item>
              </NavDropdown>,
            ]) : ''}
            {/* eslint-disable-next-line no-undef */}
            {Roles.userIsInRole(Meteor.userId(), [ROLE.ADMIN]) ? (
              [<Nav.Link className="navbar-link" id={COMPONENT_IDS.NAVBAR_LIST_STUFF_ADMIN} as={NavLink} to="/admin" key="admin">Admin</Nav.Link>,
                <NavDropdown className="navbar-link" id={COMPONENT_IDS.NAVBAR_MANAGE_DROPDOWN} title="Manage" key="manage-dropdown">
                  <NavDropdown.Item id={COMPONENT_IDS.NAVBAR_MANAGE_DROPDOWN_DATABASE} key="manage-database" as={NavLink} to="/manage-database"><CloudDownload /> Database</NavDropdown.Item>
                </NavDropdown>]
            ) : ''}
          </Nav>
          <Nav className="ms-auto robotoText">
            {currentUser === '' ? (
              <NavDropdown className="navbar-dropdown" id={COMPONENT_IDS.NAVBAR_LOGIN_DROPDOWN} title="Login">
                <NavDropdown.Item className="navbar-dropdown" id={COMPONENT_IDS.NAVBAR_LOGIN_DROPDOWN_SIGN_IN} as={NavLink} to="/signin" key="signin"><PersonFill />Sign in</NavDropdown.Item>
                <NavDropdown.Item id={COMPONENT_IDS.NAVBAR_LOGIN_DROPDOWN_SIGN_UP} as={NavLink} to="/signup" key="signup"><PersonPlusFill />Sign up</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown className="navbar-link" id={COMPONENT_IDS.NAVBAR_CURRENT_USER} title={currentUser}>
                <NavDropdown.Item id={COMPONENT_IDS.NAVBAR_SIGN_OUT} as={NavLink} to="/signout"><BoxArrowRight /> Sign out</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;

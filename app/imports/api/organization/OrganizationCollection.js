import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { Roles } from 'meteor/alanning:roles';
import BaseCollection from '../base/BaseCollection';
import { ROLE } from '../role/Role';

// export const organizationConditions = ['excellent', 'good', 'fair', 'poor'];
export const organizationPublications = {
  organization: 'Organization',
  organizationAdmin: 'OrganizationAdmin',
};

class OrganizationCollection extends BaseCollection {
  constructor() {
    super('Organizations', new SimpleSchema({
      website: {
        type: String,
        defaultValue: 'Change Me!',
      },
      location: {
        type: String,
        defaultValue: 'Change Me!',
        required: true,
      },
      organizationOwner: {
        type: String,
        defaultValue: 'empty@gmail.com',
        required: true,
        unique: true,
      },
      // I think that we only need to store the ID of the waiver
      // this means that when we cross ref the other schema, we pull the
      // contents from there
      OrganizationWaiverId: {
        type: String,
        unique: true,
      },
      visible: {
        type: Boolean,
        defaultValue: false,
        required: true,
      },
      onboarded: {
        type: Boolean,
        defaultValue: false,
        required: true,
      },
      backgroundCheck: {
        type: Boolean,
        defaultValue: false,
        required: true,
      },
      // age range looks like
      // {
      // min: x
      //  max: y
      //  }
      ageRange: {
        type: Object,
        required: true,
      },
      'ageRange.min': {
        type: SimpleSchema.Integer,
        required: true,
      },
      'ageRange.max': {
        type: SimpleSchema.Integer,
        required: true,
      },
      orgID: {
        type: SimpleSchema.Integer,
        autoValue() { // not secure
          if (this.isInsert) {
            const lastOrganization = this.constructor._collection.findOne({}, { sort: { orgID: -1 } });
            const newOrgID = lastOrganization ? lastOrganization.orgID + 1 : 1;
            return newOrgID; // starts at 1
          }
          return this.unset();
        },
        unique: true,
      },
    }));
  }

  /**
   * Defines a new Stuff item.
   * @param website the link to the webpage
   * @param profit indication of non-profit or for profit $$$$$$$$$$$$$$
   * @param organizationOwner the owner of the organization
   * @param organizationWaiverId Id of the waiver held in the waiver collection class
   * @param visible idk even f**king remember
   * @param onboarded indication of scraped data vs inputted data
   * @param location the location of the event
   * @param backgroundCheck check if org has a background check
   * @param ageRange is the age range the individual needs to be in
   * @return {String} the docID of the new document.
   */
  define({ website, profit, organizationOwner, organizationWaiverId,
    visible, onboarded, location, backgroundCheck, ageRange }) {
    const docID = this._collection.insert({
      website,
      profit,
      location,
      organizationOwner,
      organizationWaiverId,
      visible,
      onboarded,
      backgroundCheck,
      ageRange,
    });
    return docID;
  }
  // TODO: Talk to truman about what/can be updated
  // I need to come back to this after I talk to truman
  /**
   * Updates the given document.
   * @param docID the id of the document to update.
   * @param name the new name (optional).
   * @param quantity the new quantity (optional).
   * @param condition the new condition (optional).
   * @param backgroundCheck bool check
   * @param ageRange the range of age for the job
   */

  update(docID, { name, quantity, condition, backgroundCheck, ageRange }) {
    const updateData = {};
    if (name) {
      updateData.name = name;
    }
    // if (quantity) { NOTE: 0 is falsy so we need to check if the quantity is a number.
    if (_.isNumber(quantity)) {
      updateData.quantity = quantity;
    }
    if (condition) {
      updateData.condition = condition;
    }

    if (backgroundCheck !== undefined) {
      updateData.backgroundCheck = backgroundCheck;
    }
    if (ageRange) {
      updateData.ageRange = ageRange;
    }

    this._collection.update(docID, { $set: updateData });
  }

  /**
   * A stricter form of remove that throws an error if the document or docID could not be found in this collection.
   * @param { String | Object } name A document or docID in this collection.
   * @returns true
   */
  removeIt(name) {
    const doc = this.findDoc(name);
    check(doc, Object);
    this._collection.remove(doc._id);
    return true;
  }

  /**
   * Default publication method for entities.
   * It publishes the entire collection for admin and just the stuff associated to an owner.
   */
  publish() {
    if (Meteor.isServer) {
      // get the StuffCollection instance.
      const instance = this;
      /** This subscription publishes only the documents associated with the logged in user */
      Meteor.publish(organizationPublications.organization, function publish() {
        if (this.userId) {
          const username = Meteor.users.findOne(this.userId).username;
          return instance._collection.find({ owner: username });
        }
        return this.ready();
      });

      /** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */
      Meteor.publish(organizationPublications.organizationAdmin, function publish() {
        if (this.userId && Roles.userIsInRole(this.userId, ROLE.ADMIN)) {
          return instance._collection.find();
        }
        return this.ready();
      });
    }
  }

  /**
   * Subscription method for stuff owned by the current user.
   */
  subscribeStuff() {
    if (Meteor.isClient) {
      return Meteor.subscribe(organizationPublications.organization);
    }
    return null;
  }

  /**
   * Subscription method for admin users.
   * It subscribes to the entire collection.
   */
  subscribeStuffAdmin() {
    if (Meteor.isClient) {
      return Meteor.subscribe(organizationPublications.organizationAdmin);
    }
    return null;
  }

  /**
   * Default implementation of assertValidRoleForMethod. Asserts that userId is logged in as an Admin or User.
   * This is used in the define, update, and removeIt Meteor methods associated with each class.
   * @param userId The userId of the logged in user. Can be null or undefined
   * @throws { Meteor.Error } If there is no logged in user, or the user is not an Admin or User.
   */
  assertValidRoleForMethod(userId) {
    this.assertRole(userId, [ROLE.ADMIN, ROLE.USER]);
  }

  /**
   * Returns an object representing the definition of docID in a format appropriate to the restoreOne or define function.
   * @param docID
   * @return {{website: *, profit: *, location: *, organizationOwner: *, organizationWaiverId: *, visible: *, onboarded: *, owner: *, backgroundCheck: *, ageRange: *,}}
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const website = doc.website;
    const profit = doc.profit;
    const location = doc.location;
    const organizationOwner = doc.organizationOwner;
    const organizationWaiverId = doc.organizationWaiverId;
    const visible = doc.visible;
    const onboarded = doc.onboarded;
    const owner = doc.owner;
    const backgroundCheck = doc.backgroundCheck;
    const ageRange = doc.ageRange;
    return { website, profit, location, organizationOwner, organizationWaiverId, visible, onboarded, owner, backgroundCheck, ageRange };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
export const Organization = new OrganizationCollection();

import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
// import { _ } from 'meteor/underscore';
// import { Roles } from 'meteor/alanning:roles';
import BaseCollection from '../base/BaseCollection';
import { ROLE } from '../role/Role';

export const eventCategoriesPublications = {
  eventCategories: 'EventCategories',
};

class EventCategoriesCollection extends BaseCollection {
  constructor() {
    super('eventCategories', new SimpleSchema({
      categoryName: String,
      eventInfo: {
        type: Object,
        required: true,
        unique: true,
      },
      'eventInfo.organizationID': {
        type: SimpleSchema.Integer,
        required: true,
      },
      'eventInfo.eventName': {
        type: String,
        required: true,
      },
      'eventInfo.eventDate': {
        type: Date,
        required: true,
      },
    }));
  }

  /**
   * Defines a new EventCategoriesCollection object.
   * @param eventInfo event information object
   * @param categoryName name of the category
   */
  define({ eventInfo, categoryName }) {
    // error checking if there already exists a eventCategory object with this eventInfo
    if (!this.findOne({ 'eventInfo.organizationID': eventInfo.organizationID, 'eventInfo.eventName': eventInfo.eventName, 'eventInfo.eventDate': eventInfo.eventDate, categoryName: categoryName }, {})) {
      const docID = this._collection.insert({
        eventInfo,
        categoryName,
      });
      return docID;
    }
    // TODO: either return undefined/null or throw an error. should probably throw error, will figure out later
    return undefined;
  }

  /**
   * Updates the given document.
   * @param docID the id of the document to update.
   * @param eventInfo the object that will update
   * @param categoryName the catergory that will be used in the update
   */
  update(docID, { eventInfo, categoryName }) {
    const updateData = {};
    if (eventInfo) {
      updateData.eventInfo = eventInfo;
    }
    if (categoryName) {
      updateData.categoryName = categoryName;
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
   * It publishes the entire collection for all.
   */
  publish() {
    if (Meteor.isServer) {
      // get the EventCategoriesCollection instance.
      const instance = this;
      /** This subscription publishes only the documents associated with the logged in user */
      Meteor.publish(eventCategoriesPublications.eventCategories, function publish() {
        return instance._collection.find();
      });
    }
  }

  /**
   * Subscription method for eventCategories for all users.
   */
  subscribeEventCategories() {
    return Meteor.subscribe(eventCategoriesPublications.eventCategories);
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
   * @return {{eventInfo}}
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const eventInfo = doc.eventInfo;
    return { eventInfo };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
export const EventCategories = new EventCategoriesCollection();

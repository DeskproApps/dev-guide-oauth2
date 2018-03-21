import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a Deskpro app.
 */
export default class App extends React.Component {

  static propTypes = {
    /**
     * Instance of the Deskpro App Sdk Client
     */
    dpapp: PropTypes.object
  };

  /**
   * Returns the ticket owner's email
   *
   * @returns {Promise.<String, Error>}
   */
  readTicketOwnerEmail()
  {
    const { context } = this.props.dpapp;
    return context.getTabData().then(tabData => {

      const { emails, primary_email } = tabData.api_data.person;

      if (primary_email && primary_email.email) {
        return primary_email.email;
      }

      if (emails.length) {
        return emails[0].email;
      }

      return Promise.reject(new Error('could not find the email of the ticket owner'));
    });
  }

  render() {
    return (
      <div>Hello world</div>
    );
  }
}

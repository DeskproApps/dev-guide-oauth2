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

  /**
   * Checks the agent has a valid token and if not, requests a new token
   *
   * @returns {Promise.<null, Error>}
   */
  checkOAuthToken()
  {
    const {
      /**
       * @type {OauthFacade} @see https://deskpro.github.io/apps-sdk-core/reference/OauthFacade.html
       */
      oauth,
      /**
       * @type {StorageApiFacade} @see https://deskpro.github.io/apps-sdk-core/reference/StorageApiFacade.html
       */
      storage,
      /**
       * @type {DeskproAPIClient} @see https://deskpro.github.io/apps-sdk-core/reference/DeskproAPIClient.html
       */
      restApi
    } = this.props.dpapp;

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': 'token {{oauth:github:tokens}}'
    };
    return restApi
      .fetchCORS(`https://api.github.com/user`, { method: 'GET', headers })
      .catch(error => oauth.access('github').then(token => storage.setAppStorage('oauth:github:tokens', token.access_token)))
      ;
  }

  /**
   * Returns a list of Github repositories
   *
   * @param {string} email the ticket owner's email
   * @returns {Promise.<Array<Object>, Error>}
   */
  readRepositories(email)
  {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': 'token {{oauth:github:tokens}}'
    };
    const query = `${email} in:email`;

    const { restApi } = this.props.dpapp;
    return restApi.fetchCORS(
      `https://api.github.com/search/users?q=${encodeURIComponent(query)}`, { method: 'GET', headers }
    )
      .then(response => {
// we have a match, fetch the
        if (response.body.total_count === 1) {
          const { repos_url: listReposUrl } = response.body.items[0];
          return restApi.fetchCORS(listReposUrl, { method: 'GET', headers }).then(response => response.body)
        }
        return [];
      })
  }

  render() {
    return (
      <div>Hello world</div>
    );
  }
}

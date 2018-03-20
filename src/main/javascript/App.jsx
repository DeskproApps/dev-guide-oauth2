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

  render() {
    return (
      <div>Hello world</div>
    );
  }
}

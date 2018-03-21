import React from 'react';
import PropTypes from 'prop-types';

class ScreenSettings extends React.Component {

  static propTypes = {
    /**
     * @type function a callback to invoke to finish the installation
     */
    finishInstall: PropTypes.func.isRequired,

    /**
     * @type string they type of installation: install or update
     */
    installType: PropTypes.string.isRequired,

    /**
     * @type {Array<Object>} the list of settings defined in the application manifest
     */
    settings: PropTypes.array.isRequired,

    /**
     * @type {Object} a map of setting name and value
     */
    values: PropTypes.object.isRequired,

    /**
     * @type {function} the settings form constructor
     */
    settingsForm: PropTypes.func.isRequired,

    /**
     * @type {AppClient} the Deskpro Application Client
     * @see https://deskpro.github.io/apps-sdk-core/reference/AppClient.html
     */
    dpapp: PropTypes.object.isRequired
  };

  constructor() {
    super();
    // initialize our state
    this.state = { values: null, error: null };
  }

  onBeforeSubmit(values) { return Promise.resolve(values); }

  /**
   * Callback, invoked when the settings form is submitted
   *
   * @param {Object} values
   */
  onSubmit = (values) => {
    const { finishInstall } = this.props;

    this.onBeforeSubmit(values)
      .then(values => finishInstall(values).then(({ onStatus }) => onStatus())) // finish install
      .catch(error => this.setState({ error })) // display an error message
    ;
  };

  /**
   * Displays the settings screen
   *
   * @returns {XML}
   */
  render() {

    const { settings, settingsForm: SettingsForm } = this.props;
    const values = this.state.values || this.props.values;

    let formRef;
    return (
      <div>
        <SettingsForm settings={ settings } values={ values } onSubmit={this.onSubmit} ref={ref => formRef = ref} />
        <button className={'btn-action'} onClick={() => formRef.submit()}>Update Settings</button>

        { this.renderError() }

      </div>
    );
  }

  /**
   * Renders an error message
   *
   * @returns {XML|null}
   */
  renderError()
  {
    if (this.state.error) {
      return (<div style={{backgroundColor: "red", color:"white", padding: "2%"}}>{ this.state.error }</div>);
    }

    return null;
  }
}

export default ScreenSettings;

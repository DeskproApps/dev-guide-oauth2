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

  componentDidMount() { this.setDefaultValues(); }

  /**
   * Retrieves the application oauth2 settings, such as the callback url
   */
  setDefaultValues()
  {
    // obtain a reference to the OAuth client
    const {
      /**
       * @type {OauthFacade} @see https://deskpro.github.io/apps-sdk-core/reference/OauthFacade.html
       */
      oauth
    } = this.props.dpapp;
    const { values } = this.props;

    // retrieve the default oauth settings for the app such as the redirect url
    oauth.settings('github')
      .then( oauthSettings => this.setState({
        values: { ...values, githubCallbackURL: oauthSettings.urlRedirect }
      }))
      .catch( error => this.setState({ values: null, error: 'Failed to read default app oauth settings' }) )
    ;
  }

  /**
   * Hook method called before the actual submit takes place.
   * Checks the form values by obtaining an access token
   *
   * @param {Object} values
   * @returns {Promise.<Object, String>}
   */
  onBeforeSubmit(values)
  {
    // build the connnection information
    const connection = {
      urlRedirect: values.githubCallbackURL,
      urlAuthorize: `https://github.com/login/oauth/authorize`,
      urlAccessToken: `https://github.com/login/oauth/access_token`,
      clientId: values.githubClientId,
      clientSecret: values.githubClientSecret
    };

    const { oauth } = this.props.dpapp;
    return oauth.register('github', connection)            // register a connection to provider
      .then(connection => oauth.access('github'))          // request an oauth token from the provider
      .then(token => ({ ...values, githubClientSecret: "***" })  )
      .catch(error => Promise.reject('Invalid Oauth settings')) // display an error message
      ;
  }

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

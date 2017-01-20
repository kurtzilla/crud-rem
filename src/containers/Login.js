import React, {Component} from 'react';
import { connect } from 'react-redux';
import { login } from '../services/auth';


class Login extends Component {
  
  componentWillMount() {
    this.login = login(this.props.redirect, this.context.router);
  }
  
  componentWillUnmount() {
    this.login.hide();
    this.login = null;
  }
  
  render() {
    return (
      <div className="Login">
        <a className="Login-loginButton" onClick={() => login()}>Login with Auth0</a>
      </div>
    );
  }
}

Login.contextTypes = {
  router: React.PropTypes.object
}

export default connect()(Login);

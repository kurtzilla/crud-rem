import React, {Component} from 'react';
import {connectProfile} from './auth';

class Home extends Component {
  static propTypes = {
    ...connectProfile.PropTypes
  };
  
  render() {
    
    return (
      <div className="Home">
        <div className="Home-intro">
          <h2>You're home now.</h2>
        </div>
      </div>
    );
  }
}

export default connectProfile(Home);

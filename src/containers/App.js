import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link, Match, Redirect } from 'react-router';
import { isLoggedIn, logout } from '../services/auth';

import Home from './Home';
import GamesPage from './GamesPage';
import GameForm from './GameForm';
import Login from './Login';
import EditProfile from './EditProfile';

class App extends Component {
  
  // TODO commented out right now because not sure the binding is necessary?
  // constructor(props){
  //   super (props);
  //   this.goLogout.bind(this);
  // }
  
  goLogout(e) {
    e.preventDefault()
    logout(this.context.router);
  }
  
  render() {
      
    return (
      <div className="ui container">
        <div className="ui six item menu">
          <Link className="item" activeClassName="active" activeOnlyWhenExact to="/">Home</Link>
          <Link className="item" activeClassName="active" activeOnlyWhenExact to="/games">Games</Link>
          <Link className="item" activeClassName="active" activeOnlyWhenExact to="/games/new">Add New Game</Link>
  
          <Link className="item" activeClassName="active" activeOnlyWhenExact to="/login">Login</Link>
          <Link className="item" activeClassName="active" activeOnlyWhenExact to="/profile/edit">Profile</Link>
          <a className="item" onClick={(e) => this.goLogout(e)}>Log Out</a>
        </div>
  
        <Match exactly pattern="/" component={Home}/>
        <Match exatcly pattern="/games" component={GamesPage}/>
        <Match pattern="/games/new" component={GameForm}/>
        <Match pattern="/login" component={Login}/>
  
        {/*
         TODO this route needs to be protected
         Does this mechanism work on groups/nesting? Or is there a
         need for a declaration on each Match?
         */}
        <Match pattern="/profile/edit" render={() => (
          isLoggedIn() ? (
              <EditProfile />
            ) : (
              <Redirect to={{
                pathname: '/login',
                state: { referrer: '/profile/edit' }
              }} />
            )
        )}/>
        
      </div>
    );
  }
}

App.contextTypes = {
  router: React.PropTypes.object
}

export default connect()(App)

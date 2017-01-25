import decode from 'jwt-decode';
import { EventEmitter } from 'events';
import React, {Component, PropTypes} from 'react';
import Auth0Lock from 'auth0-lock';
import Promise from 'bluebird';

import { authenticated } from '../actions/auth_actions';


if (!process.env.REACT_APP_AUTH0_CLIENT_ID || !process.env.REACT_APP_AUTH0_DOMAIN) {
  throw new Error('Please define `REACT_APP_AUTH0_CLIENT_ID` and `REACT_APP_AUTH0_DOMAIN` in your .env file');
}


const NEXT_PATH_KEY = 'next_path';
const LOGIN_ROUTE = '/login';// this is the page to go to when in need of auth
const ROOT_ROUTE = '/';
const DEFAULT_POST_LOGIN_ROUTE = '/profile/edit';// this is where to go after auth
const ID_TOKEN_KEY = 'auth0_id_token';
const ACCESS_TOKEN_KEY = 'auth0_access_token';
const PROFILE_KEY = 'auth0_profile';


const events = new EventEmitter();

const lock = new Auth0Lock(
  process.env.REACT_APP_AUTH0_CLIENT_ID,
  process.env.REACT_APP_AUTH0_DOMAIN, {
    auth: {
      redirectUrl: `${window.location.origin}${LOGIN_ROUTE}`,
      responseType: 'token'
    }
  }
);

// v4 - pass in the router and assign to lock object
export function login(nextPath, router, dispatch) {
  var nPath = nextPath || DEFAULT_POST_LOGIN_ROUTE;
  setNextPath(nPath);
  
  //console.log('LOCK Login', router, dispatch)
  lock.router = router;
  lock.dispatch = dispatch;
  lock.show({});
  
  return {
    hide() {
      lock.hide();
    }
  }
}

// call redux action
lock.on('authenticated', authResult => {
  // 1
  console.log('LOCK', lock)
  lock.dispatch(authenticated(authResult));
});


export function postAuth(authResult){
  // 3
  // console.log('POST AUTH')
  
  setIdToken(authResult.idToken);
  setAccessToken(authResult.accessToken);
  
  // return a promise
  return new Promise(function(resolve, reject) {
    lock.getUserInfo(authResult.accessToken, (error, profile) => {
      if (error) {
        setProfile({error});
        reject(error);
      }
  
      setProfile(profile);
      let redirectTo = getNextPath();
      clearNextPath();
  
      // console.log('logged in - now redirecting', redirectTo)
      lock.router.transitionTo(redirectTo);
      resolve(profile);
    });
  });
}


// v4 - pass in the router and transitionTo location
export function logout(router, transitionTo) {
  // console.log('loggin out', router, transitionTo)
  
  clearNextPath();
  clearIdToken();
  clearAccessToken();
  clearProfile();
  
  router.transitionTo(transitionTo || ROOT_ROUTE);
}

// v4 - export function
export function isLoggedIn() {
  
  const idToken = getIdToken();
  // console.log('verifying login at local storage', idToken)
  return idToken && !isTokenExpired(idToken);
}

function getTokenExpirationDate(encodedToken) {
  const token = decode(encodedToken);
  if (!token.exp) { return null; }
  
  const date = new Date(0);
  date.setUTCSeconds(token.exp);
  
  return date;
}

function isTokenExpired(token) {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate < new Date();
}

export function requireAuth(nextState, replace) {
  if (!isLoggedIn()) {
    setNextPath(nextState.location.pathname);
    replace({pathname: LOGIN_ROUTE});
  }
}





export function connectProfile(WrappedComponent) {
  return class ProfileContainer extends Component {
    state = {
      profile: null
    };
    
    componentWillMount() {
      this.profileSubscription = subscribeToProfile((profile) => {
        this.setState({profile});
      });
    }
    
    componentWillUnmount() {
      this.profileSubscription.close();
    }
    
    render() {
      return (
        <WrappedComponent
          {...this.props}
          profile={this.state.profile}
          onUpdateProfile={this.onUpdateProfile}
        />
      );
    }
    
    onUpdateProfile = (newProfile) => {
      return updateProfile(this.state.profile.user_id, newProfile);
    }
  };
}

connectProfile.PropTypes = {
  profile: PropTypes.object,
  onUpdateProfile: PropTypes.func
};



export function fetchAsUser(input, init={}) {
  const headers = init.headers || {};
  
  return fetch(input, {
    ...init,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getIdToken()}`,
      ...headers
    }
  }).then((response) => {
    if (!response.ok) { throw new Error(response); }
    return response;
  });
}


function subscribeToProfile(subscription) {
  events.on('profile_updated', subscription);
  
  if (isLoggedIn()) {
    subscription(getProfile());
    
    lock.getUserInfo(getAccessToken(), (error, profile) => {
      if (error) { return setProfile({error}); }
      setProfile(profile);
    });
  }
  
  return {
    close() {
      events.removeListener('profile_updated', subscription);
    }
  };
}

async function updateProfile(userId, newProfile) {
  try {
    const response = await fetchAsUser(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(newProfile)
    });
    
    const profile = await response.json();
    setProfile(profile);
  } catch (error) {
    return error;
  }
}

function setProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  events.emit('profile_updated', profile);
}

export function getProfile() {
  return JSON.parse(localStorage.getItem(PROFILE_KEY));
}

function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
  events.emit('profile_updated', null);
}

function setIdToken(idToken) {
  localStorage.setItem(ID_TOKEN_KEY, idToken);
}

function setAccessToken(accessToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function getIdToken() {
  return localStorage.getItem(ID_TOKEN_KEY);
}

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function clearIdToken() {
  localStorage.removeItem(ID_TOKEN_KEY);
}

function setNextPath(nextPath) {
  localStorage.setItem(NEXT_PATH_KEY, nextPath);
}

function getNextPath() {
  return localStorage.getItem(NEXT_PATH_KEY) || ROOT_ROUTE;
}

function clearNextPath() {
  localStorage.removeItem(NEXT_PATH_KEY);
}



import { postAuth, getIdToken, getProfile } from '../services/auth0';

export const AUTHENTICATED = 'AUTHENTICATED';
export const LOGOUT = 'LOGOUT';
export const USER_DATA_FETCHED = 'USER_DATA_FETCHED';


export function authenticated(authResult) {
  return (dispatch) => {
    // 2
    // console.log('AUTHENTICATED ACTION')
    
    postAuth(authResult)
    .then((res) => {
      //console.log('RESULT', res);
      
      dispatch(auth0IsNowLocal(getIdToken(), getProfile()));
      
      // do match to our db steps here
      return 'ok';
    })
    .then(() => {
      dispatch(userDataFetched('fake email'));
    })
    .catch(err => {
      console.log('ERROR in authenticated action', err)
    });
  }
}

export function auth0IsNowLocal(auth0Token, profile){
  return {
    type: AUTHENTICATED,
    auth0Token,
    profile
  };
}

export function userDataFetched(json){
  return {
    type: USER_DATA_FETCHED,
    json
  };
}

// also on auth
// link user account
// if not exists - create
// can we do as jwt? to ensure local data is in sync with our server (integrity)
// save info locally - not sure what we need - that can be refined later
// now we can redirect!

export function logout(data, router, transitionTo) {
  console.log('action LOGOUT')
  return {
    type: LOGOUT,
    data,
    router,
    transitionTo
  }
}

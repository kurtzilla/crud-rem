import { AUTHENTICATED, LOGOUT, USER_DATA_FETCHED } from '../actions/auth_actions';
import { logout } from '../services/auth0';


const initialState = {
  isFetching: false,
  auth0_idToken: '',
  auth0_accessToken: '',
  auth0_profile: {},
  username: '',
  user_profile: {}
}


export default function auth(state = {
  isFetching: false,
  profile: {}
}, action = {}){
  switch(action.type){
    
    case USER_DATA_FETCHED:
      console.log('USER DATA FETCHED reducer', action)
      return Object.assign({}, state, {
        emailAddress: action.json
        
        //TODO add more data!
      })
      
    case AUTHENTICATED:
      // this is happening after auth?
      console.log('AUTHENTICATED reducer', action)
      
      return Object.assign({}, state, {
        isFetching: false,
        profile: action.profile
      })
      
    case LOGOUT:
      const { router, transitionTo } = action;
      logout(router, transitionTo);
      // empty the state
      return Object.assign({}, state, {
        isFetching: false,
        profile: {}
      })
      
    default:
      return state;
  }
}
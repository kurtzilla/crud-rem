import { combineReducers } from 'redux';

import auth from './auth_reducer';
import games from './games_reducer';

export default combineReducers({
  auth,
  games
});
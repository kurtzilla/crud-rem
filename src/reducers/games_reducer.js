import { SET_GAMES, ADD_GAME } from '../actions/games_actions';

export default function games(state = [], action = {}){
  switch(action.type){
    case ADD_GAME:
      // return the entire collection of games plus the newly added game
      return [
        ...state,
        action.game
      ];
    case SET_GAMES:
      return action.games;
    default:
      return state;
  }
}
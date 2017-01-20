import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchGames } from '../actions/games_actions';

import GamesList from '../components/GamesList';

class GamesPage extends Component{
  componentDidMount(){
    this.props.fetchGames();
  }
  
  render(){
    return(
      <div>
        <h1>Games List</h1>
        
        <GamesList games={this.props.games} />
      </div>
    );
  }
}

GamesPage.propTypes = {
  games: React.PropTypes.array.isRequired,
  fetchGames: React.PropTypes.func.isRequired
}

function mapStateToProps(state){
  return {
    games: state.games
  }
}

export default connect(mapStateToProps, { fetchGames })(GamesPage);
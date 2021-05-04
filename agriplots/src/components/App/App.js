import React from 'react';
import logo from '../../assets/agri-plots.png';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Dashboard from '../Dashboard/Dashboard';
import Home from '../Home/Home.js';
import NavBar from '../NavBar/NavBar';
import { useAuth0 } from "@auth0/auth0-react";
import { Container } from 'reactstrap';

const App = () => {
  const { error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  return (
    <div className="App">
	<header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
	</header>
	  <BrowserRouter>
	  <NavBar />
	  <Container className="flex-grow-1 mt-5">
            <Switch>
            <Route path="/home" component={Home} />
            <Route path="/dashboard" component={Dashboard} />
          </Switch>
	  </Container>
	  </BrowserRouter>
    </div>
  );
};

export default App;

import React from 'react';
import logo from './agri-plots.png';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
//import Login from '../Login/Login';
//import Logout from '../Logout/Logout';
import Dashboard from '../Dashboard/Dashboard';
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
      <div className="wrapper">
	  <BrowserRouter>
	  <NavBar />
	  <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
          </Switch>
	  </Container>
	  </BrowserRouter>
      </div>
    </div>
  );
};

export default App;

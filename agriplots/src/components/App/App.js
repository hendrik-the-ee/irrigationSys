import logo from './agri-plots.png';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Dashboard from '../Dashboard/Dashboard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
	  <img src={logo} className="App-logo" alt="logo" />
      </header>
      <BrowserRouter>
        <Switch>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;

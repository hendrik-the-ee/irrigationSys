import React from 'react';
import Loading from '../Loading/Loading';
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Plot from 'react-plotly.js';

export const HomeComponent = () => {
  return(
      <h1>TBD</h1>
  );
};

export default withAuthenticationRequired(HomeComponent, {
    onRedirecting: () => <Loading />,
});

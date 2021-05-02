import React from 'react';
import Loading from '../Loading/Loading';
import { withAuthenticationRequired } from "@auth0/auth0-react";

export const DashboardComponent = () => {
  return(
    <h2>Dashboard</h2>
  );
};

export default withAuthenticationRequired(DashboardComponent, {
    onRedirecting: () => <Loading />,
});

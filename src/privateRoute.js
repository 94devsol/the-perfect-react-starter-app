import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { auth } = useContext(AuthContext);
  const { loading } = auth;

  if (loading) {
    return (
      <Route
        {...rest}
        render={() => {
          return <p>Loading...</p>;
        }}
      />
    );
  }
  // if loading is set to true (when our function useEffect(() => {}, []) is not executed), we are rendering a loading component;

  return (
    <Route
      {...rest}
      render={(routeProps) => {
        return auth.data ? (
          <Component {...routeProps} />
        ) : (
          <Redirect to="/login" />
        );
      }}
    />
  );
};

export default PrivateRoute;

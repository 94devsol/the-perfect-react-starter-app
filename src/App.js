import React, { lazy, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import AccessibleNavigationAnnouncer from "./components/AccessibleNavigationAnnouncer";
import packageJson from "../package.json";
import PrivateRoute from "./privateRoute";
import { AuthContext } from "./context/AuthContext";

global.appVersion = packageJson.version;
const Layout = lazy(() => import("./containers/Layout"));
const Login = lazy(() => import("./pages/Login"));
const CreateAccount = lazy(() => import("./pages/CreateAccount"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

const semverGreaterThan = (versionA, versionB) => {
  const versionsA = versionA.split(/\./g);

  const versionsB = versionB.split(/\./g);
  while (versionsA.length || versionsB.length) {
    const a = Number(versionsA.shift());

    const b = Number(versionsB.shift());
    // eslint-disable-next-line no-continue
    if (a === b) continue;
    // eslint-disable-next-line no-restricted-globals
    return a > b || isNaN(b);
  }
  return false;
};

function App() {
  const { auth } = useContext(AuthContext);
  console.log("auth >> ", auth?.data);

  useEffect(() => {
    fetch("/meta.json")
      .then((response) => response.json())
      .then((meta) => {
        const latestVersion = meta.version;
        const currentVersion = global.appVersion;

        const shouldForceRefresh = semverGreaterThan(
          latestVersion,
          currentVersion
        );
        if (shouldForceRefresh) {
          console.log(
            `We have a new version - ${latestVersion}. Should force refresh`
          );

          if (caches) {
            // Service worker cache should be cleared with caches.delete()
            console.log("Invalidating cache..!");
            caches.keys().then(function (names) {
              for (let name of names) caches.delete(name);
            });
          } // delete browser cache and hard reload
          // window.location.reload(true);
          window.location.reload();
          // setLoading(false);
          // setLatestVersion(false);
        } else {
          console.log(
            `You already have the latest version - ${latestVersion}. No cache refresh needed.`
          );
          // setLoading(false);
          // setLatestVersion(true);
        }
      }, []);
  });
  return (
    <>
      <Router>
        <AccessibleNavigationAnnouncer />
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/create-account" component={CreateAccount} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/" component={Layout} />
          {/* If you have an index page, you can remothis Redirect */}
          <PrivateRoute path="/" component={Layout} />
        </Switch>
      </Router>
    </>
  );
}

export default App;

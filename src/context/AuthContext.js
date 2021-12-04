import React, { createContext, useState, useEffect } from "react";
import { HASURA_ENDPOINT_DEV } from "../config";
import {
  createClient,
  Provider,
  defaultExchanges,
  subscriptionExchange,
} from "urql";
import { SubscriptionClient } from "subscriptions-transport-ws";
export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ loading: true, data: null });

  const subscriptionClient = new SubscriptionClient(
    `wss://${HASURA_ENDPOINT_DEV}`,
    {
      reconnect: true,
      connectionParams: {
        headers: {
          Authorization: `Bearer ${auth?.data?.accessToken}`,
        },
      },
    }
  );

  let headers = {};

  if (auth?.data?.accessToken) {
    headers = {
      Authorization: `Bearer ${auth?.data?.accessToken}`,
    };
  }

  const client = createClient({
    url: `https://${HASURA_ENDPOINT_DEV}`,
    exchanges: [
      ...defaultExchanges,
      subscriptionExchange({
        forwardSubscription(operation) {
          return subscriptionClient.request(operation);
        },
      }),
    ],
    requestPolicy: "network-only",
    // fetch: fetch,
    fetchOptions: () => {
      if (!auth) {
        return true;
      }
      return {
        headers,
      };
    },
  });

  const setAuthData = (data) => {
    setAuth({ data: data });
  };

  useEffect(() => {
    setAuth({
      loading: false,
      data: JSON.parse(localStorage.getItem("authData")),
    });
  }, []);
  //2. if object with key 'authData' exists in localStorage, we are putting its value in auth.data and we set loading to false.
  //This function will be executed every time component is mounted (every time the user refresh the page);

  useEffect(() => {
    console.log(auth, "auth");
    localStorage.setItem("authData", JSON.stringify(auth.data));
  }, [auth.data]);
  // 1. when **auth.data** changes we are setting **auth.data** in localStorage with the key 'authData'.

  return (
    <AuthContext.Provider value={{ auth, setAuthData }}>
      <Provider value={client}>{children}</Provider>
    </AuthContext.Provider>
  );
};

export default AuthProvider;

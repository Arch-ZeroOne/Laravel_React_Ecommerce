import { createContext, useContext, useState } from "react";
//user - intended to store user informations
//token -authentication token receive upon logging in , acting as a key to protected routes and resources
//We stored all of this in a state so that they are ready for access later when making API requests
const StateContext = createContext({
  user: null,
  token: null,
  setUser: {},
  setToken: {},
});

export const ContextProvider = ({ children }) => {
  //Stores user details
  const [user, setUser] = useState({});
  //Fetches authentication token
  const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));

  //When a token is present it  stores in state or  in the localstorage
  const setToken = (token) => {
    //updates and interacts with the browsers localstorage
    _setToken(token);
    if (token) {
      localStorage.setItem("ACCESS_TOKEN", token);
    } else {
      localStorage.removeItem("ACCESS_TOKEN");
    }
  };

  return (
    <StateContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);

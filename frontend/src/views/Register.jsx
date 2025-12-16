import React, { useRef } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axiosClient from "../axiosClient";
import { useStateContext } from "../context/ContextProvider";
function Register() {
  const { setUser, setToken } = useStateContext();
  const Submit = (e) => {
    //*Prevents the default submission behavior which reload the page
    e.preventDefault();
    const payLoad = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    axiosClient
      .post("/register", payLoad)
      .then(({ data }) => {
        const { name } = data.user;

        setUser(data.user);
        setToken(data.token);
        showAlertMessage(name);
      })
      .catch((error) => {
        const { response } = error;

        if (response && response.status === 422) {
          showErrorMessage(response.data.errors);
        }
      });
  };
  //*gets the user info without reloding the DOM
  //*we used this to get the values from the inputs without querying the dom
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  return (
    <div className="login-signup-form animated fadeInDown">
      <div className="form">
        <h1 className="title">Create A New Account</h1>
        <form onSubmit={Submit}>
          <input ref={nameRef} type="name" placeholder="Name" />
          <input ref={emailRef} type="email" placeholder="Email" />
          <input ref={passwordRef} type="password" placeholder="Password" />
          <button className="btn btn-block">Register</button>
          <p className="message">
            Already Registered?
            <Link to={"/login"}>Go to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const showAlertMessage = (name) => {
  if (name) {
    Swal.fire({
      icon: "success",
      title: "Registration successfull",
      text: `${name} you have been registered`,
    });
  }
};
const showErrorMessage = (error) => {
  if (error) {
    Swal.fire({
      icon: "error",
      text: `Error`,
      title: `Registration failed`,
    });
  }
};

export default Register;

import React, { useRef } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axiosClient";
import Swal from "sweetalert2";
import { useStateContext } from "../context/ContextProvider";

function Login() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const { setToken, setUser } = useStateContext();

  const Submit = (e) => {
    e.preventDefault();

    const payLoad = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    axiosClient
      .post("/login", payLoad)
      .then((response) => {
        const { message } = response.data;
        const { token } = response.data;
        const { user } = response.data;

        setUser(user);
        setToken(token);

        Swal.fire({
          icon: "success",
          text: message,
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          text: "Account not found",
        });
      });
  };

  const handleGoogleLogin = () => {
    // Redirect to your backend Google OAuth endpoint
    window.location.href = "http://your-backend-url/api/auth/google";
  };

  return (
    <div className="login-signup-form animated fadeInDown">
      <div className="form">
        <h1 className="title">Login To Your Account</h1>
        <form onSubmit={Submit}>
          <input ref={emailRef} type="email" placeholder="Email" />
          <input ref={passwordRef} type="password" placeholder="Password" />
          <button className="btn btn-block">Login</button>

          <div style={{ margin: "20px 0", textAlign: "center", color: "#999" }}>
            <span>OR</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn btn-block"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              backgroundColor: "#fff",
              color: "#333",
              border: "1px solid #ddd",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.002 0 5.48 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <p className="message">
            Not Registered? <Link to={"/register"}>Create a new account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

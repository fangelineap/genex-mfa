'use client'

import React from "react";
import login, { enableMFA } from "./actions";

const LoginPage = () => {
  const loginFunc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    console.log("Form Data:", data);

    try {
      await login(formData);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <>
      <div>Login Page</div>
      <form onSubmit={loginFunc}>
        <input type="text" name="email" placeholder="Enter your email" />
        <input type="password" name="password" placeholder="Enter your password" />
        <button>Login</button>
      </form>
    </>
  );
};

export default LoginPage;

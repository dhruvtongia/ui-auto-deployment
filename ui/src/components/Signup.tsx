import { useRef, useState } from "react";
import Cookies from "js-cookie";
import { NavLink } from "react-router-dom";
import { API_SERVER_URI as apiServerUrl } from "../constant";

const Signup = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const messageRef = useRef<HTMLInputElement>(null!);

  const registerUser = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (confirmPassword !== password) {
      messageRef.current.innerHTML =
        "Password and Confirm Password are not same";

      setTimeout(() => {
        messageRef.current.innerHTML = "";
        setPassword("");
        setConfirmPassword("");
      }, 2000);
      return;
    }
    const response = await fetch(`${apiServerUrl}/api/user/signup`, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        // "Authorization": "Bearer my-token",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      Cookies.set("vercel-token", data.token, {
        expires: 1,
        secure: true,
      });
    } else {
      messageRef.current.innerHTML = data.error;

      setTimeout(() => {
        messageRef.current.innerHTML = "";
        setUsername("");
        setPassword("");
        setConfirmPassword("");
      }, 2000);
    }
  };

  return (
    <div className="flex h-dvh flex-col px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-slate-50">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div
          id="error-msg"
          className="mb-3 text-red-500"
          ref={messageRef}
        ></div>
        <form className="space-y-6" onSubmit={registerUser} method="POST">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-slate-50"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="user@xyz.com"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-slate-50"
              >
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                value={password}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-slate-50"
              >
                Confirm Password
              </label>
            </div>
            <div className="mt-2">
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                value={confirmPassword}
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="current-confirm-password"
                required
                className="block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full content-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Register
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?
          <NavLink to="/login">
            <a className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              Login
            </a>
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signup;

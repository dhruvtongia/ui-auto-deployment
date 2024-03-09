import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Navbar = () => {
  const navigate = useNavigate();

  const tokenValue = Cookies.get("vercel-token");
  const logoutUser = () => {
    Cookies.remove("vercel-token");
    navigate("/");
  };

  return (
    <div className="flex justify-end p-4 bg-blue-950">
      {!tokenValue ? (
        <button
          onClick={() => {
            navigate("/login");
          }}
          className="h-10 w-16 border rounded-md border-spacing-1 border-slate-50 mr-2 hover:bg-slate-50 hover:text-slate-950 transition duration-600"
        >
          Login
        </button>
      ) : (
        ""
      )}
      {!tokenValue ? (
        <button
          onClick={() => {
            navigate("/signup");
          }}
          className="h-10 w-20 border rounded-md border-spacing-1 border-slate-50 mr-2 hover:bg-slate-50 hover:text-slate-950 transition duration-600"
        >
          Register
        </button>
      ) : (
        " "
      )}

      {tokenValue ? (
        <button
          onClick={logoutUser}
          className="h-10 w-20 border rounded-md border-spacing-1 border-slate-50 mr-2 hover:bg-slate-50 hover:text-slate-950 transition duration-600"
        >
          Logout
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default Navbar;

import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end p-4 bg-blue-950">
      <button
        onClick={() => {
          navigate("/login");
        }}
        className="h-10 w-16 border rounded-md border-spacing-1 border-slate-50 mr-2 hover:bg-slate-50 hover:text-slate-950 transition duration-600"
      >
        Login
      </button>
      <button
        onClick={() => {
          navigate("/signup");
        }}
        className="h-10 w-20 border rounded-md border-spacing-1 border-slate-50 mr-2 hover:bg-slate-50 hover:text-slate-950 transition duration-600"
      >
        Register
      </button>
      <button
        onClick={() => {
          navigate("/");
        }}
        className="h-10 w-20 border rounded-md border-spacing-1 border-slate-50 mr-2 hover:bg-slate-50 hover:text-slate-950 transition duration-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;

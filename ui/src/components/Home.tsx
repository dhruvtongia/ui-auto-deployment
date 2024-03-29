import Cookies from "js-cookie";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_SERVER_URI as apiServerUrl } from "../constant";

const Home = () => {
  const [isdisabled, setIsDisabled] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<String>("");
  const navigate = useNavigate();
  const tokenValue = Cookies.get("vercel-token");
  const messageRef = useRef<HTMLParagraphElement>(null!);
  const [deployed, setDeployed] = useState<boolean>(false);

  const uploadRepo = async () => {
    if (!tokenValue) {
      navigate("/login");
    }
    const response = await fetch(`${apiServerUrl}/project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${tokenValue}`,
      },
    });
    const data = await response.json();

    if (response.status === 201) {
      console.log("----- ", data.projectId);
      setProjectId(data.projectId);
      setIsDisabled(true);

      const interval = setInterval(async () => {
        const res = await fetch(`${apiServerUrl}/status/${data.projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${tokenValue}`,
          },
        });
        const statusData = await res.json();
        console.log("statusData: ", statusData);
        if (statusData.status === "DEPLOYED") {
          setDeployed(true);
          setIsDisabled(false);
          clearInterval(interval);
        }
      }, 5000);
    } else {
      messageRef.current.innerHTML = data.error;
      setTimeout(() => {
        messageRef.current.innerHTML = "";
      }, 5000);
    }
  };

  return (
    <div>
      <h1 className="mt-[5rem] text-5xl text-center font-bold">
        Deploy your React App with just click of a button
      </h1>
      <div className="flex flex-col ml-20 mr-20 items-center border rounded-md border-slate-800 mt-10 p-5">
        <div
          id="error-msg"
          className="mb-3 text-red-500"
          ref={messageRef}
        ></div>
        <div className="w-full">
          <label
            htmlFor="first_name"
            className="block mb-2 font-medium text-gray-900 dark:text-white"
          >
            Enter your Github repo url
          </label>
          <input
            type="text"
            id="first_name"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="John"
            required
            disabled={isdisabled}
          />
        </div>

        <button
          onClick={uploadRepo}
          disabled={isdisabled}
          className="block w-full mt-5 h-10 border bg-neutral-600 text-slate-50 rounded-md border-spacing-1 border-slate-50"
        >
          {deployed
            ? "Deployed"
            : isdisabled
            ? `Deploying (${projectId})`
            : "Upload"}
        </button>
      </div>

      {deployed && (
        <div className="flex flex-col ml-20 mr-20 items-center border rounded-md border-slate-800 mt-10 p-">
          <h2 className="pb-2 text-xl">
            Your website is successfully deployed!
          </h2>
          <a
            className="flex flex-row group"
            href={`https://${projectId}.swift-deploy.dhruvtongia.tech`}
            target="_blank"
          >
            <h1 className="text-xl group-hover:text-teal-300 text-slate-200">
              Visit Website
            </h1>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="inline-block h-4 w-4 group-hover:text-teal-300 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-focus-visible:-translate-y-1 group-focus-visible:translate-x-1 motion-reduce:transition-none ml-1 translate-y-px"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </a>
        </div>
      )}
    </div>
  );
};

export default Home;

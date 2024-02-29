const Home = () => {
  const uploadRepo = async () => {
    const response = await fetch("http://localhost:8000/project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        // "Authorization": "Bearer my-token",
      },
    });

    const data = await response.json();
  };
  return (
    <div>
      <h1 className="mt-[5rem] text-5xl text-center font-bold">
        Deploy your React App with just click of a button
      </h1>
      <div className="flex flex-col ml-20 mr-20 items-center border rounded-md border-slate-800 mt-10 p-5">
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
          />
        </div>

        <button
          onClick={uploadRepo}
          className="block w-full mt-5 h-10 border bg-neutral-600 text-slate-50 rounded-md border-spacing-1 border-slate-50"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default Home;

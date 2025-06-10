import Layout from "./layout.tsx";

function Home() {
  return (
    <Layout>
      <div className="flex-1 p-2">
        <div className="flex-1 p-4 border-1 rounded-md place-items-center">
          <h1 className="text-2xl font-bold">Welcome to Sprimo</h1>
          <p className="mt-2 text-gray-600">
            A dashboard for monitoring sprints
          </p>
        </div>
        <div className="flex-1 p-4 mt-4 border-1 rounded-md">
          <h2 className="mt-4 text-xl font-semibold">Additional Content</h2>
          <p className="mt-2 text-gray-600">
            You can place more information or components here as needed.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default Home;

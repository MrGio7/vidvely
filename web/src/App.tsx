import "./App.css";
import { useGetUserInfoQuery } from "./graphql/generated";
import Loader from "./loader";

function App() {
  const { loading, error, data } = useGetUserInfoQuery();

  if (!!loading) return <Loader />;

  if (!data) return <h1>No Data</h1>;

  return <div className="App">HI1</div>;
}

export default App;

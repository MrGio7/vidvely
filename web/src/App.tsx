import "./App.css";
import { useGetUserInfoQuery } from "./graphql/generated";
import Loader from "./loader";

function App() {
  const { loading, error, data } = useGetUserInfoQuery();

  if (!!loading) return <Loader />;

  // if (!!error)
  //   window.location.replace(
  //     "https://vidvaley-dev.auth.eu-central-1.amazoncognito.com/oauth2/authorize?client_id=3cermrrihd00fn1742frogg4ip&response_type=code&scope=email+openid+phone&redirect_uri=http://localhost:5173/auth/"
  //   );

  if (!data) return <h1>No Data</h1>;

  return <div className="App">HI1</div>;
}

export default App;

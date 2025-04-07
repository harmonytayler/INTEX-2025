import TestComponent from '../components/TestComponent';
import Logout from '../components/security/Logout';
import AuthorizeView, {
  AuthorizedUser,
} from '../components/security/AuthorizeView';

function HomePage() {
  return (

    //Wrap the entire page in AuthorizeView to ensure the user is authorized
    //before rendering the page content
    //This will also handle the redirect to the login page if the user is not authorized
    //The AuthorizeView component will also provide the user context to the page
    //The AuthorizedUser component will be used to display the user's email
    //The Logout component will be used to log the user out
    //<AuthorizeView>
    <>
          <span>
        <Logout>
          Logout <AuthorizedUser value="email" />
        </Logout>
      </span>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Home Page</h2>
        <p className="mb-6 text-gray-600">
          This is the home page that displays all test items:
        </p>
        <TestComponent />
      </div>
    </>
    //</AuthorizeView>
  );
}

export default HomePage;

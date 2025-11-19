import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Welcome to Anyware Dashboard</h1>
          <p className="text-text-secondary mt-2">
            {isAuthenticated
              ? "You are logged in. Access the dashboard to view announcements and quizzes."
              : "Please log in to access your dashboard and stay up to date with announcements and quizzes."}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => {
              if (!isAuthenticated) {
                login();
              }
              navigate("/dashboard");
            }}
            className="w-full bg-turquoise text-white hover:bg-turquoise/90"
          >
            {isAuthenticated ? "Go to dashboard" : "Log in"}
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" className="w-full" onClick={logout}>
              Log out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;


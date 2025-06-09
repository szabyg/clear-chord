import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-xl">
          The page you are looking for does not exist.
        </p>
        <div className="py-4">
          <Link to="/">
            <Button className="text-lg px-6 py-3">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

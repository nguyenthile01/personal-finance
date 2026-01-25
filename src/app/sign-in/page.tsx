import ErrorDialog from "@/components/error-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/store";

import { signIn } from "@/store/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const dispatch = useAppDispatch();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dispatch(signIn({ email, password }));
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      setErrorMessages([message]);
      setErrorDialogOpen(true);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Label className="block">
          <span className="text-sm">Email</span>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </Label>

        <Label className="block">
          <span className="text-sm">Password</span>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </Label>

        <div className="text-sm text-right">
          <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
        </div>

        <Button type="submit" className="w-full py-2 rounded">Sign in</Button>
        <Button variant="outline" className="w-full py-2 rounded" onClick={() => navigate('/sign-up')}>Sign up</Button>
      </form>
      {errorMessages.length > 0 && (
        <p className="mt-4 text-red-600">
          Email or password is incorrect.
        </p>
      )}
      {errorDialogOpen && (
        <ErrorDialog open={errorDialogOpen} openChange={(open) => setErrorDialogOpen(open)} title="Sign In Error" message={["An unexpected error occurred."]} children={undefined} />
      )}
    </main>
  );
}
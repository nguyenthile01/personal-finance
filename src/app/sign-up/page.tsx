import ErrorDialog from "@/components/error-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: replace with real auth call
        try {
            if (!isEmailValid(email))
                return;
            if (!isPasswordValid(password))
                return;
            if (!doPasswordsMatch(password, confirmPassword))
                return;
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });
            if (error)
                return;
            navigate('/sign-in');
            // TODO: proceed after successful signup (e.g. redirect)
        } catch (error) {
            setErrorDialogOpen(true);
        }
    };

    const isEmailValid = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isPasswordValid = (password: string) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password);
    };

    const doPasswordsMatch = (password: string, confirmPassword: string) => {
        return password === confirmPassword;
    };

    return (
        <main className="max-w-md mx-auto p-6">
            <h1 className="text-2xl mb-4">Sign up</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <label htmlFor="email" className="block">
                    <span className="text-sm">Username</span>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className={cn("mt-1 block w-full rounded border px-3 py-2", {
                            "border-red-500": !isEmailValid(email) && email.length > 0
                        })}
                    />
                </label>

                <label htmlFor="password" className="block">
                    <span className="text-sm">Password</span>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className={cn("mt-1 block w-full rounded border px-3 py-2", {
                            "border-red-500": !isPasswordValid(password) && password.length > 0
                        })}
                    />
                </label>

                <label htmlFor="confirmPassword" className="block">
                    <span className="text-sm">Confirm Password</span>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className={cn("mt-1 block w-full rounded border px-3 py-2", {
                            "border-red-500": !doPasswordsMatch(password, confirmPassword) && confirmPassword.length > 0
                        })}
                    />
                </label>
                <Button type="submit" className="w-full py-2 rounded">Sign up</Button>
            </form>
            <div>
                {!isEmailValid(email) && email.length > 0 && (
                    <p className="mt-2 text-xs text-red-500">
                        Please enter a valid email address.
                    </p>
                )}
                {!isPasswordValid(password) && password.length > 0 && (
                    <p className="mt-2 text-xs text-red-500">
                        Password does not meet the required criteria.
                    </p>
                )}
                {!doPasswordsMatch(password, confirmPassword) && confirmPassword.length > 0 && (
                    <p className="mt-2 text-xs text-red-500">
                        Passwords do not match.
                    </p>
                )}
            </div>
            <div className="mt-4 text-sm">
                Already have an account?{" "}
                <a href="/sign-in" className="text-blue-500 hover:underline">
                    Sign in
                </a>
            </div>
            {errorDialogOpen && (
                <ErrorDialog open={errorDialogOpen} openChange={(open) => setErrorDialogOpen(open)} title="Sign Up Error" message={["An unexpected error occurred."]} children={undefined} />
            )}
        </main>
    );
}
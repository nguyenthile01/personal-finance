import ErrorDialog from "@/components/error-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import { signUp } from "@/store/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const dispatch = useAppDispatch();

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
            dispatch(signUp({email, password}));
            navigate("/sign-in")
            // TODO: proceed after successful signup (e.g. redirect)
        } catch (error) {
            setErrorDialogOpen(true);
            console.error("Sign up error:", error);
        }
    };

    const isEmailValid = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isPasswordValid = (password: string) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password) || doPasswordsMatch(password, confirmPassword);
    };

    const doPasswordsMatch = (password: string, confirmPassword: string) => {
        return password === confirmPassword;
    };

    return (
        <main className="max-w-md mx-auto p-6">
            <h1 className="text-2xl mb-4">Sign up</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Label htmlFor="email" className="block">
                    <span className="text-sm">Username</span>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className={cn("mt-1 block w-full rounded border px-3 py-2", {
                            "border-red-500": !isEmailValid(email) && email.length > 0
                        })}
                    />
                </Label>

                <Label htmlFor="password" className="block">
                    <span className="text-sm">Password</span>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className={cn("mt-1 block w-full rounded border px-3 py-2", {
                            "border-red-500": !isPasswordValid(password) && password.length > 0
                        })}
                    />
                </Label>

                <Label htmlFor="confirmPassword" className="block">
                    <span className="text-sm">Confirm Password</span>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className={cn("mt-1 block w-full rounded border px-3 py-2", {
                            "border-red-500": !doPasswordsMatch(password, confirmPassword) && confirmPassword.length > 0
                        })}
                    />
                </Label>
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
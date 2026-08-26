import { SignupForm } from "@/components/auth/signup-form";

const SignUpPage = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 md:p-10 overflow-hidden">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
        }}
      />

      {/* Nội dung Form */}
      <div className="relative z-10 w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignUpPage;

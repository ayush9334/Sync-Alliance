import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await API.post("/auth/login", formData);

    console.log("Login Response:", res.data);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    console.log("Token:", localStorage.getItem("token"));

    navigate("/dashboard");
  } catch (err) {
    console.log("Login Error:", err.response?.data || err);

    alert(err.response?.data?.message || "Login failed");
  }
};

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-slate-950 px-6">

      {/* ================= LIVE COLLAB Background ================= */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">

        <div className="grid grid-cols-4 gap-28 rotate-[-25deg] scale-150 opacity-[0.03]">

          {Array.from({ length: 100 }).map((_, index) => (
            <span
              key={index}
              className="whitespace-nowrap text-4xl font-black tracking-widest text-red-600"
            >
              LIVE COLLAB
            </span>
          ))}

        </div>

      </div>

      {/* Ambient Blue Glows */}

      <div className="absolute left-0 top-0 h-[450px] w-[450px] rounded-full bg-blue-700/10 blur-[180px]" />

      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-sky-500/10 blur-[170px]" />

      <div className="absolute left-20 top-24 h-44 w-44 animate-pulse rounded-full bg-blue-500/15 blur-[120px]" />

      <div className="absolute bottom-24 right-24 h-56 w-56 animate-pulse rounded-full bg-sky-500/10 blur-[150px]" />

      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/5 blur-[180px]" />

      {/* ================= Login Card ================= */}

      <div className="relative z-10 w-full max-w-md rounded-[32px] border border-zinc-800 bg-zinc-900/45 p-10 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)]">

        {/* ================= SA Logo ================= */}

        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-zinc-700 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 transition-all duration-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]">

          {/* Blue Glow */}
          <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-blue-500/25 blur-3xl"></div>

          {/* White Glow */}
          <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-white/20 blur-3xl"></div>

          {/* Shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>

          <span className="relative text-6xl font-black tracking-tight">

            <span className="bg-gradient-to-b from-sky-200 via-blue-400 to-blue-700 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]">
              S
            </span>

            <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
              A
            </span>

          </span>

        </div>

        <h1 className="bg-gradient-to-r from-white via-zinc-200 to-blue-300 bg-clip-text text-center text-5xl font-extrabold tracking-tight text-transparent">
          Sync Alliance
        </h1>

        <p className="mt-3 text-center text-sm tracking-wide text-zinc-400">
          Collaborate. Communicate. Build Together.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 space-y-7">

          {/* Email */}

          <div>

            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-4 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/40"
            />

          </div>

          {/* Password */}

          <div>

            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-4 pr-20 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-white focus:ring-4 focus:ring-white/20"
              />
                            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400 transition-all duration-300 hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {/* Forgot Password */}

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-zinc-500 transition-all duration-300 hover:text-blue-400"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}

          <button
            type="submit"
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 py-4 text-lg font-semibold text-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(59,130,246,0.55)] active:scale-95"
          >
            {/* Shine Animation */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></span>

            <span className="relative">
              Sign In
            </span>
          </button>

        </form>

        {/* Divider */}

        <div className="my-8 flex items-center">
          <div className="h-px flex-1 bg-zinc-800"></div>

          <span className="mx-4 text-xs uppercase tracking-[0.35em] text-zinc-500">
            OR
          </span>

          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        {/* Register */}

        <p className="text-center text-sm text-zinc-500">

          Don't have an account?

          <Link
            to="/register"
            className="ml-2 font-semibold text-white transition duration-300 hover:text-blue-400"
          >
            Create Account
          </Link>

        </p>

        {/* Bottom Tagline */}

        <p className="mt-8 text-center text-xs tracking-[0.25em] text-zinc-600">
          BUILT FOR MODERN TEAMS
        </p>
              </div>

      {/* Decorative Bottom Glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-[80%] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[140px]" />

    </div>
  );
}

export default Login;
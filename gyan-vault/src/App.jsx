import { useState } from 'react'
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgot, setIsForgot] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      <div className="auth-card p-10 w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            Gyan Vault
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            AI Powered Knowledge System
          </p>
        </div>

        {!isForgot ? (
          <>
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                className="input-field mb-4"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              className="input-field mb-4"
            />

            <input
              type="password"
              placeholder="Password"
              className="input-field mb-6"
            />

            <button className="primary-btn mb-4">
              {isLogin ? "Login" : "Sign Up"}
            </button>

            {isLogin && (
              <p
                className="text-right text-sm text-blue-400 cursor-pointer hover:underline mb-4"
                onClick={() => setIsForgot(true)}
              >
                Forgot Password?
              </p>
            )}

            <p className="text-center text-sm text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span
                className="text-blue-400 cursor-pointer hover:underline"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setIsForgot(false);
                }}
              >
                {isLogin ? "Sign Up" : "Login"}
              </span>
            </p>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="input-field mb-6"
            />

            <button className="primary-btn mb-4">
              Send Reset Link
            </button>

            <p
              className="text-center text-sm text-blue-400 cursor-pointer hover:underline"
              onClick={() => {
                setIsForgot(false);
                setIsLogin(true);
              }}
            >
              Back to Login
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default App

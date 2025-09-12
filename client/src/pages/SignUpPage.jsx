import { Link, useNavigate } from "react-router-dom";
import loginImage from "../Images/abc4.png";
import "../styles/auth.css";
import { useState, useEffect } from "react";
import Axios from "../Axios";
import { toast } from "react-toastify";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
    role: "user",
    name: "",
  });
  const [errors, setErrors] = useState({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // 'available', 'taken', 'checking', null

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    if (!name) return "Name is required";
    if (!nameRegex.test(name)) return "Name must be at least 2 characters long and contain only letters and spaces";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) return "Password is required";
    if (!passwordRegex.test(password)) {
      return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)";
    }
    return "";
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  // Debounced email checking
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!user.email || validateEmail(user.email)) {
        setEmailStatus(null);
        return;
      }

      setIsCheckingEmail(true);
      setEmailStatus('checking');
      
      try {
        const response = await Axios.get(`/check-email?email=${encodeURIComponent(user.email)}`);
        if (response.data.success) {
          setEmailStatus(response.data.available ? 'available' : 'taken');
          if (!response.data.available) {
            setErrors({ ...errors, email: "This email is already registered. Please use a different email." });
          } else {
            // Clear email error if email is available
            if (errors.email && errors.email.includes("already registered")) {
              setErrors({ ...errors, email: "" });
            }
          }
        }
      } catch (error) {
        console.error("Email check error:", error);
        setEmailStatus(null);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmailAvailability, 500); // 500ms debounce
    return () => clearTimeout(timeoutId);
  }, [user.email]);

  const handleInputChange = (field, value) => {
    setUser({ ...user, [field]: value });
    
    // Clear previous error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }

    // Real-time validation
    let error = "";
    switch (field) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      default:
        break;
    }

    if (error) {
      setErrors({ ...errors, [field]: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const nameError = validateName(user.name);
    const emailError = validateEmail(user.email);
    const passwordError = validatePassword(user.password);

    if (nameError || emailError || passwordError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError
      });
      toast.error("Please fix the validation errors before submitting", {
        position: "bottom-right",
      });
      return;
    }

    try {
      console.log("Sending signup request:", user);
      const response = await Axios.post("/register", user);
      console.log("Signup response:", response);
      if (response.data.success === true) {
        toast.success("Account created successfully! Please login to continue.", {
          position: "bottom-right",
        });
        navigate("/login");
      } else {
        toast.error(response.data.message, {
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      console.error("Error response:", error.response);
      
      // Handle specific error cases
      if (error.response?.data?.message?.includes("Email already exists")) {
        setErrors({ ...errors, email: "This email is already registered. Please use a different email." });
      }
      
      toast.error(error.response?.data?.message || "Something went wrong", {
        position: "bottom-right",
      });
    }
  };
  return (
    <div className="login-page">
      <div className="login-div div1">
        <div className="login-box">
          <h1 className="login-heading">Sign up</h1>
          <h2 className="login-subheading">
            Already have an account?{" "}
            <Link
              style={{
                textDecoration: "none",
                color: "#6286A0",
                pointerEvents: "cursor",
              }}
              to="/login"
            >
              Log in
            </Link>
          </h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-div">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={user.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? "error-input" : ""}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="input-div">
              <label htmlFor="email">Email</label>
              <div className="email-input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  className={`${errors.email ? "error-input" : ""} ${emailStatus === 'available' ? "success-input" : ""}`}
                />
                {emailStatus === 'checking' && (
                  <span className="email-status checking">Checking...</span>
                )}
                {emailStatus === 'available' && (
                  <span className="email-status available">✓ Available</span>
                )}
                {emailStatus === 'taken' && (
                  <span className="email-status taken">✗ Already taken</span>
                )}
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="input-div">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={user.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                name="password"
                placeholder="Enter a strong password"
                className={errors.password ? "error-input" : ""}
              />
              {user.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill strength-${getPasswordStrength(user.password)}`}
                    ></div>
                  </div>
                  <span className="strength-text">
                    {getPasswordStrength(user.password) < 3 ? "Weak" : 
                     getPasswordStrength(user.password) < 5 ? "Medium" : "Strong"}
                  </span>
                </div>
              )}
              {errors.password && <span className="error-message">{errors.password}</span>}
              <div className="password-requirements">
                <small>Password must contain:</small>
                <ul>
                  <li className={user.password.length >= 8 ? "valid" : ""}>At least 8 characters</li>
                  <li className={/[a-z]/.test(user.password) ? "valid" : ""}>One lowercase letter</li>
                  <li className={/[A-Z]/.test(user.password) ? "valid" : ""}>One uppercase letter</li>
                  <li className={/\d/.test(user.password) ? "valid" : ""}>One number</li>
                  <li className={/[@$!%*?&]/.test(user.password) ? "valid" : ""}>One special character (@$!%*?&)</li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="login-button"
              type="submit"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
      <div className="login-div div2">
        <img className="login-image-r" src={loginImage} alt="image" />
      </div>
    </div>
  );
};

export default SignUpPage;

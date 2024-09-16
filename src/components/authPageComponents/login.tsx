import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

interface FormData {
  email: string;
  password: string;
}

interface LoginProps {
  setLoading: (loading: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setLoading }) => {
  const navigate = useNavigate();

  const schema = yup.object().shape({
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    password: yup.string().min(6).max(30).required("Password is required"),
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    const { email, password } = data;
    setLoading(true);

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast.success("User logged in successfuly!");
        navigate("/chat");
      })
      .catch((error) => {
        const errorCode = error.code;
        toast.success(`error logging in, ${errorCode}`);
        return;
      });
  };

  return (
    <>
      <ToastContainer position="top-left" />
      <div className="flex flex-col flex-1 items-center justify-center  text-white">
        <h1 className="text-2xl mb-5">Welcome Back!</h1>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <input
            type="email"
            placeholder="Email"
            className="p-3 bg-slate-800 focus:outline-none rounded"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 m-0 text-sm">{errors.email.message}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            className="p-3 bg-slate-800 focus:outline-none rounded"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 m-0 text-sm">
              {errors.password.message}
            </p>
          )}

          <input
            type="submit"
            value="Sign Up"
            className="bg-sky-600 p-2 rounded-sm cursor-pointer"
          />
        </form>
      </div>
    </>
  );
};

export default Login;

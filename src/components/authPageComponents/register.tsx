import { doc, setDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import avatarIcon from "../../assets/avatar.png";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import upload from "../../helper/upload";

interface FormData {
  username: string;
  email: string;
  password: string;
  avatar?: FileList;
  blocked?: string[];
  bio?: string;
}

interface LoginProps {
  setLoading: (loading: boolean) => void;
}

const Register: React.FC<LoginProps> = ({ setLoading }) => {
  const navigate = useNavigate();

  const [file, setFile] = useState<FileList | null>();

  const schema = yup.object().shape({
    username: yup.string().min(3).max(30).required("Username is required"),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    password: yup.string().min(6).max(30).required("Password is required"),
    avatar: yup.mixed(),
    bio: yup.string(),
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    const { email, password, username, bio } = data;

    setLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        let photoURL;

        if (file && file[0]) {
          photoURL = await upload(file[0]);
        }

        await updateProfile(user, {
          displayName: username,
          photoURL: photoURL || avatarIcon,
        });

        const userData = {
          id: user.uid,
          username: user.displayName,
          email: user.email,
          avatar: user.photoURL,
          blocked: [],
          bio: bio ? bio : "",
        };

        await setDoc(doc(db, "users", user.uid), userData);
        navigate("/chat");
        toast.success("Account has been created successfully!");
      })
      .catch((error) => {
        const errorCode = error.code;
        toast.error(errorCode);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <>
      <ToastContainer position="top-left" />
      <div className="flex flex-col flex-1 items-center justify-center  border-l-[1px] border-slate-400 text-white">
        <h1 className="text-2xl">Create An Account</h1>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <input
            type="file"
            className="hidden"
            id="avatarInputUnique"
            {...register("avatar")}
            onChange={(e) => setFile(e.currentTarget.files)}
          />
          <label
            htmlFor="avatarInputUnique"
            className="flex items-center justify-between cursor-pointer mt-5"
          >
            <img
              src={avatarIcon}
              alt="avatarIcon"
              className="w-10 rounded-md"
            />
            <p className="underline cursor-pointer">Upload Image</p>
          </label>
          <input
            type="text"
            placeholder="Username"
            className="p-3 bg-slate-800 focus:outline-none rounded"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-red-500 m-0 text-sm">
              {errors.username.message}
            </p>
          )}

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
            type="text"
            placeholder="bio"
            className="p-3 bg-slate-800 focus:outline-none rounded"
            {...register("bio")}
          />
          {errors.bio && (
            <p className="text-red-500 m-0 text-sm">{errors.bio.message}</p>
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

export default Register;

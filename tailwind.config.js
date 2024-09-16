/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/auth/authPage.tsx",
    "./src/pages/chat/chatPage.tsx",
    "./src/components/authPageComponents/forgotPassword.tsx",
    "./src/components/authPageComponents/login.tsx",
    "./src/components/authPageComponents/register.tsx",
    "./src/components/chatPageComponents/mainChat.tsx",
    "./src/components/chatPageComponents/sidebar.tsx",
    "./src/components/chatPageComponents/userChatInfoSidebar.tsx",
  ],
  theme: {
    extend: {
      colors: {
        "custom-grey": "rgba(17,25,40,0.75)",
      },
      boxShadow: {
        "uniform-white": "0px 0px 10px rgba(255, 255, 255, 0.4)",
      },
      backdropBlur: {
        sm: "4px",
      },
      backdropSaturate: {
        150: "150%",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};

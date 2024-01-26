import { Layout, Row } from "antd";
import AuthForm from "@/components/auth/AuthForm";
import { FC } from "react";

const Auth: FC = () => {
  return (
    <Layout>
      <div
        style={{ height: "70vh" }}
        className="flex items-center justify-center my-auto"
      >
        <AuthForm />
      </div>
    </Layout>
    // <div className="container  flex flex-col justify-center align-middle">

    // </div>
  );
};

export default Auth;

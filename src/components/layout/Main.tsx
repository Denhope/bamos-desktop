import { Button, Layout, Result, Space } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Auth from "@/components/auth/Auth";

import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";

import BaseLayout from "./BaseLayout";
import { RouteNames } from "@/router";
import { Route, Routes, useNavigate } from "react-router-dom";

const Main: FC = () => {
  const { isAuth } = useTypedSelector((state) => state.auth);
  const navigate = useNavigate();
  return (
    <>
      {!isAuth ? (
        <Layout style={{ minHeight: "100vh" }}>
          <Header
            className="flex justify-between my-0 px-0"
            style={{
              // marginLeft: 'auto',

              background: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Space
              onClick={() => navigate(RouteNames.HOME)}
              className="text-xl cursor-pointer  px-3 first-line:align-middle  uppercase  text-gray-500"
            >
              bamos
            </Space>
          </Header>
          <Layout>
            {" "}
            <Content>
              <Routes>
                <Route element={<Auth />} path={RouteNames.LOGIN} />
                <Route
                  element={
                    <Result
                      style={{ height: "75vh" }}
                      status="403"
                      // title="403"
                      subTitle="Sorry, you are not authorized to BAMOS."
                      extra={
                        <Button
                          onClick={() => navigate(RouteNames.LOGIN)}
                          type="primary"
                        >
                          LOG IN
                        </Button>
                      }
                    />
                  }
                  path={"*"}
                />
              </Routes>
            </Content>
          </Layout>

          <Footer
            style={{
              textAlign: "center",
              position: "sticky",
              bottom: "0",
            }}
          >
            ©2023 Created by Kavalchuk D.
          </Footer>
        </Layout>
      ) : (
        <BaseLayout />
      )}
    </>
  );
};

export default Main;

import React, { ReactNode } from "react";
import "./styles.css";
import { AsideBar } from "../AsideBar";

type PropsComponent = {
  children: ReactNode;
  className? :string;
};

export const Container: React.FC<PropsComponent> = ({ children, className }) => {
  return (
    <div className={`${className} flex`}>
      <AsideBar />
      <div className={`overflow-y-scroll flex-1 sm:h-[calc(100dvh-8.5dvh)] h-[78.5dvh] ${className}`}>{children}</div>
    </div>
  );
};

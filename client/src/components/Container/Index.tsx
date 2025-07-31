import React, { ReactNode } from "react";
import "./styles.css";

type PropsComponent = {
  children: ReactNode;
  className:string;
};

export const Container: React.FC<PropsComponent> = ({ children, className }) => {
  return (
    <div className={className}>
      <div className="content">{children}</div>
    </div>
  );
};

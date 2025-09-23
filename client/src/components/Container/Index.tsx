import React, { ReactNode } from "react";
import "./styles.css";

type PropsComponent = {
  children: ReactNode;
  className? :string;
};

export const Container: React.FC<PropsComponent> = ({ children, className }) => {
  return (
    <div className={className}>
      <div className={`overflow-y-scroll h-[82.5dvh] ${className}`}>{children}</div>
    </div>
  );
};

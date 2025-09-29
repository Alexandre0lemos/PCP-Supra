import React, { ReactNode } from "react";
import "./styles.css";

type PropsComponent = {
  children: ReactNode;
  className? :string;
};

export const Container: React.FC<PropsComponent> = ({ children, className }) => {
  return (
    <div className={className}>
      <div className={`overflow-y-scroll sm:h-[calc(78.5dvh+1.5rem)] h-[78.5dvh] ${className}`}>{children}</div>
    </div>
  );
};

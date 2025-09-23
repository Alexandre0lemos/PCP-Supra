import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import "./styles.css";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  transition?: number;
  onBlur?: boolean;
  className?: string
};

export const Modal: React.FC<PropsWithChildren<Props>> = ({
  children,
  isOpen,
  onClose,
  transition,
  onBlur,
  className
}) => {
  const [isVisible, setIsVisible] = useState<boolean | null>();
  const [isActive, setIsActive] = useState<boolean | null>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const abrir = () => {
    setIsActive(true);

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 50);
  };

  const fechar = () => {
    setIsVisible(false);

    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, transition);
  };

  const cancelarOperacao = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    cancelarOperacao()

    if (isOpen) {
      abrir();
    } else {
      fechar();
    }

    return () => {
      cancelarOperacao()
    };
  }, [isOpen]);

  if (isActive) {
    return (
      <div
        onClick={(e) => {
          if (e.target == e.currentTarget && onClose) {
            onClose();
            fechar();
            cancelarOperacao()
          }
        }}
        className={`modal-container absolute left-0 top-0 z-10 ${onBlur ? `backdrop-blur-[1px]` : ""} h-full w-full`}
      >
        <div
          style={{
            transition: `${
              Number(transition) ? Number(transition) / 1000 : 0
            }s`,
          }}
          className={`w-full ${className} flex justify-center modal-content ${
            isVisible ? "modal-content-open" : "modal-content-close"
          }`}
        >
          {children}
        </div>
      </div>
    );
  }
};

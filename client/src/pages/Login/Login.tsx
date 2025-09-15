import {
  IonAlert,
  IonInput,
  IonPage,
  IonTitle,
} from "@ionic/react";

import { useEffect, useState } from "react";
import { api } from "../../urlApiConfig";

import "./Login.css";
import { User } from "lucide-react";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alerta, setAlerta] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erroConexao, setErroConexao] = useState(false);

  useEffect(() => {
    localStorage.clear();
  }, []);

  const mostrarAlerta = (msg: string) => {
    if (!erroConexao) {
      setMensagem(msg);
      setAlerta(true);
    }
  };

  const autenticarUsuario = async () => {
    if (!username.trim() || !password.trim()) {
      mostrarAlerta("Preencha todos os campos.");
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    try {
      const res = await fetch(`${api}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await res.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.name == "AbortError") {
        setErroConexao(true);
      }
    }
  };

  const realizarLogin = async () => {
    const resposta = await autenticarUsuario();

    if (resposta?.success) {
      const dataAtual = new Date().toLocaleDateString("pt-br");
      localStorage.setItem("username", username);
      localStorage.setItem("datelogin", dataAtual);
      localStorage.setItem("isAdmin?", resposta["isAdmin?"]);
      location.href =
        resposta["isAdmin?"] == 1 ? "/ordens-aberta" : "/ordens-aberta";
    } else if (resposta?.success == false) {
      mostrarAlerta("Usuário ou senha incorreta.");
      setUsername("");
      setPassword("");
    }
  };

  return (
    <IonPage>
      <div
        className="bg-white min-h-screen flex flex-col justify-center items-center px-4 py-8"
        color="dark"
      >
        <div
          id="container"
          className="w-full border border-gray-300 max-w-md bg-white rounded-lg shadow-lg p-6 md:p-8"
        >
          <div className="border-b flex justify-center border-gray-200 pb-4 mb-6" color="light">
            <div className="flex flex-col items-center gap-2 w-min">
              <User size={38} />
              <IonTitle className="text-center text-gray-800">
                Login
              </IonTitle>
            </div>
          </div>

          <div className="space-y-4">
            <div className=" border-b border-gray-300">
              <IonInput
                value={username}
                label="Usuário:"
                labelPlacement="floating"
                className="text-gray-700"
                onIonInput={(e) =>
                  setUsername(e.detail.value?.toLowerCase().trim() ?? "")
                }
              />
            </div>

            <div color="light" className=" border-b border-gray-300">
              <IonInput
                value={password}
                label="Senha:"
                labelPlacement="floating"
                type="password"
                className="text-gray-700"
                onIonInput={(e) => setPassword(e.detail.value ?? "")}
                onKeyDown={(e) => e.key === "Enter" && realizarLogin()}
              />
            </div>

            <div
              className="mt-6 w-full h-12 flex rounded-sm justify-center items-center text-lg bg-[var(--ion-color-primary-tint)]"
            >
              <button
              className="!text-white w-full h-full font-semibold"
              onClick={realizarLogin}
              >Entrar</button>
            </div>
          </div>

          {!erroConexao && (
            <IonAlert
              isOpen={alerta}
              onDidDismiss={() => setAlerta(false)}
              header="Atenção"
              message={mensagem}
              buttons={["OK"]}
            />
          )}
        </div>

        <IonAlert
          isOpen={erroConexao}
          onDidDismiss={() => setErroConexao(false)}
          header={"Problema de conexão"}
          message={"verifique com o suporte técnico"}
          buttons={["OK"]}
        />
      </div>
    </IonPage>
  );
};

export default Login;

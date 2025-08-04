import {
  IonAlert,
  IonButton,
  IonInput,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import { useEffect, useState } from "react";
import { api } from "../../urlApiConfig";

import "./Login.css";

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
        resposta["isAdmin?"] == 1 ? "/lancamentos" : "ordens-aberta";
    } else if (resposta?.success == false) {
      mostrarAlerta("Usuário ou senha incorreta.");
      setUsername("");
      setPassword("");
    }
  };

  return (
    <IonPage>
      <div
        className="bg-white h-full flex flex-col justify-center"
        color="dark"
      >
        <div
          id="container"
          className="h-11/12 p-5 flex flex-col justify-center"
        >
          <IonToolbar className="p-5" color="dark">
            <IonTitle className="text-center p-2">Login</IonTitle>

            <IonItem color="dark">
              <IonInput
                value={username}
                label="Usuário:"
                labelPlacement="floating"
                onIonInput={(e) =>
                  setUsername(e.detail.value?.toLowerCase().trim() ?? "")
                }
              />
            </IonItem>

            <IonItem color="dark">
              <IonInput
                value={password}
                label="Senha:"
                labelPlacement="floating"
                type="password"
                onIonInput={(e) => setPassword(e.detail.value ?? "")}
                onKeyDown={(e) => e.key === "Enter" && realizarLogin()}
              />
            </IonItem>

            <IonButton
              onClick={realizarLogin}
              expand="block"
              color="danger"
              className="mt-4"
            >
              Entrar
            </IonButton>

            {!erroConexao && (
              <IonAlert
                isOpen={alerta}
                onDidDismiss={() => setAlerta(false)}
                header="Atenção"
                message={mensagem}
                buttons={["OK"]}
              />
            )}
          </IonToolbar>
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

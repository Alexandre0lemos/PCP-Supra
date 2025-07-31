import {
  IonContent,
  IonPage,
  IonSelect,
  IonSelectOption,
  useIonRouter,
  IonSpinner,
  IonAlert,
} from "@ionic/react";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Header } from "../../layout/Header";
import { ArrowDown } from "lucide-react";
import ModalForm from "../../components/ModalForm/ModalForm";
import { SearchInput } from "../../components/Search/SearchInput";
import "./OrdensAberta.css";
import { api } from "../../urlApiConfig";

interface Ordem {
  CODPROD: string;
  PRODUTO: string;
  NUMOP: string;
  NUMLOTE: string;
  FALTA: number;
  DTLANC: string;
  QTPRODUZIDA: number;
  QTPRODUZIR: number;
  SECAO: string;
}

const OrdensAberta: React.FC = () => {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [filterSearch, setFilterSearch] = useState("");
  const [secaoSelecionada, setSecaoSelecionada] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useIonRouter();

  const [alertErro, setAlertErro] = useState(false);

  const tentativas = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const username = localStorage.getItem("username");
  const datelogin = localStorage.getItem("datelogin");

  useEffect(() => {
    const autenticarUsuario = () => {
      const hoje = new Date().toLocaleDateString("pt-br");
      if (!username || datelogin !== hoje) {
        router.push("/", "forward", "replace");
      } else {
        setSupervisor(username);
      }
    };

    const carregarOrdens = async () => {
      try {
        const res = await fetch(`${api}/view/ordens-aberta`);
        if (!res.ok) throw new Error("API offline");
        const dados = await res.json();
        setOrdens(dados);
        setLoading(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } catch {
        tentativas.current++;
        if (tentativas.current >= 1000) {
          console.error("Muitas tentativas de reconexão.");
        } else {
          if (!intervalRef.current) {
            intervalRef.current = setInterval(carregarOrdens, 500);
          }
        }
      }
    };

    autenticarUsuario();
    carregarOrdens();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [router, username, datelogin]);

  const secoes = useMemo(() => {
    return [...new Set(ordens.map((o) => o.SECAO))].sort();
  }, [ordens]);

  const ordensFiltradas = useMemo(() => {
    return ordens.filter((o) => {
      const nomeMatch = o.PRODUTO.toLowerCase().includes(
        filterSearch.toLowerCase()
      );
      const secaoMatch = secaoSelecionada ? o.SECAO === secaoSelecionada : true;
      return nomeMatch && secaoMatch;
    });
  }, [ordens, filterSearch, secaoSelecionada]);

  const agrupadasPorProduto = useMemo(() => {
    return ordensFiltradas.reduce((acc, ordem) => {
      acc[ordem.CODPROD] = acc[ordem.CODPROD] || [];
      acc[ordem.CODPROD].push(ordem);
      return acc;
    }, {} as Record<string, Ordem[]>);
  }, [ordensFiltradas]);

  if (loading) {
    return (
      <IonPage>
        <Header />
        <IonContent fullscreen color="dark">
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <IonSpinner
              color={"light"}
              name="crescent"
              className="spinner-preto"
            />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen color="dark">
        <div
          className="mr-3 mb-2 mt-2 ml-4 pt-2 flex gap-3"
          id="filter-content"
        >
          <IonSelect
            value={secaoSelecionada}
            onIonChange={(e) => setSecaoSelecionada(e.detail.value)}
            color="medium"
            placeholder="Selecionar seção"
          >
            <IonSelectOption value="">GERAL</IonSelectOption>
            {secoes.map((secao) => (
              <IonSelectOption key={secao} value={secao}>
                {secao}
              </IonSelectOption>
            ))}
          </IonSelect>

          <SearchInput onPesquisar={setFilterSearch} isOpen={false} />
        </div>

        {Object.entries(agrupadasPorProduto).map(([codProd, ordens]) => (
          <div key={codProd} className="m-3 ml-4 p-2 bg-zinc-800 rounded-md">
            <div className="flex justify-between items-center">
              <h1 className="text-white font-semibold">
                {ordens[0].PRODUTO} ({codProd})
              </h1>
              <button
                aria-label="Mostrar/Esconder ordens"
                onClick={(e) => {
                  const content =
                    e.currentTarget.parentElement?.parentElement
                      ?.lastElementChild;

                  if (content?.classList.contains("activate")) {
                    (content as HTMLIonContentElement).style.maxHeight = "0px";
                    content.classList.remove("activate");
                  } else {
                    (content as HTMLIonContentElement).classList.add(
                      "activate"
                    );
                    (content as HTMLIonContentElement).style.maxHeight =
                      (content as HTMLIonContentElement).scrollHeight + "px";
                  }
                  e.currentTarget.firstElementChild?.classList.toggle(
                    "arrow-activate"
                  );
                }}
              >
                <ArrowDown color="white" size={24} id="arrow" />
              </button>
            </div>

            <p className="text-gray-400 mb-2">{ordens.length} ordem(ns)</p>

            <div id="content-orders" className="flex flex-col gap-5">
              {ordens.map((ordem, i) => (
                <div
                  key={i}
                  className="flex justify-between items-start bg-zinc-800 p-3 rounded text-white"
                >
                  <div>
                    <p>
                      <strong>OP:</strong> {ordem.NUMOP}
                    </p>
                    <p>
                      <strong>Lote:</strong> {ordem.NUMLOTE}
                    </p>
                    <p>
                      <strong>Falta:</strong> {ordem.FALTA}
                    </p>
                    <p>
                      <strong>Data:</strong> {ordem.DTLANC}
                    </p>
                  </div>

                  <ModalForm
                    onLancarSucesso={() => {
                      setLoading(true);
                      fetch(`${api}/view/ordens-aberta`)
                        .then((res) => res.json())
                        .then((data) => setOrdens(data))
                        .catch(() => {
                          tentativas.current = 0;
                          intervalRef.current = setInterval(() => {
                            fetch(`${api}/view/ordens-aberta`)
                              .then((res) => res.json())
                              .then((data) => {
                                setOrdens(data);
                                setLoading(false);
                                clearInterval(intervalRef.current!);
                              });
                          }, 500);
                        })
                        .finally(() => setLoading(false));
                    }}
                    onAlertErro={setAlertErro}
                    className="btn-lancamento"
                    codprod={ordem.CODPROD}
                    dt_criacao={ordem.DTLANC}
                    falta={ordem.FALTA}
                    num_lote={ordem.NUMLOTE}
                    num_op={ordem.NUMOP}
                    produto={ordem.PRODUTO}
                    qt_produzida={ordem.QTPRODUZIDA}
                    qt_produzir={ordem.QTPRODUZIR}
                    secao={ordem.SECAO}
                    supervisor={supervisor}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <IonAlert
          onIonAlertDidDismiss={() => setAlertErro(false)}
          subHeader="Erro de conexão"
          isOpen={alertErro}
          message={"Processo não foi concluido devido a um erro de conexão"}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default OrdensAberta;

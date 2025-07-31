import pandas as pd
import os
from datetime import datetime, date

xlsPath = "utils\\ordens_aberta.xls"
dbMain = "db\\dbMain.db"
xlsPath = "C:\\Users\\Supra\\Desktop\\Sync\\server\\utils\\ordens_aberta.xls"

import pandas as pd
import sqlite3

def puxar_ordens_aberta():
    xls = pd.read_excel(xlsPath, engine="xlrd")

    xls["DTLANC"] = pd.to_datetime(xls["DTLANC"], errors='coerce')
    df = xls[["CODPROD", "DTLANC", "FALTA", "NUMLOTE", "NUMOP", "PRODUTO", "QTPRODUZIDA", "QTPRODUZIR", "SECAO"]]

    conn = sqlite3.connect(dbMain)
    cursor = conn.cursor()

    cursor.execute("""
        DROP TABLE IF EXISTS ordens_aberta;
    """)
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ordens_aberta (
            CODPROD INTEGER,
            DTLANC TEXT,
            FALTA NUMERIC,
            NUMLOTE INTEGER,
            NUMOP INTEGER,
            PRODUTO TEXT,
            QTPRODUZIDA NUMERIC,
            QTPRODUZIR NUMERIC,
            SECAO TEXT
        )
    ''')

    for _, row in df.iterrows():
        dt = row["DTLANC"]
        dt_formatado = dt.strftime('%d/%m/%Y') if pd.notnull(dt) else None

        cursor.execute('''
            INSERT INTO ordens_aberta (
                CODPROD, DTLANC, FALTA, NUMLOTE, NUMOP, PRODUTO,
                QTPRODUZIDA, QTPRODUZIR, SECAO
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            row["CODPROD"],
            dt_formatado,
            row["FALTA"],
            row["NUMLOTE"],
            row["NUMOP"],
            row["PRODUTO"],
            row["QTPRODUZIDA"],
            row["QTPRODUZIR"],
            row["SECAO"]
        ))

    conn.commit()
    conn.close()
    
    return True

def select_ordens_aberta():
    conn = sqlite3.connect(dbMain)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ordens_aberta (
            CODPROD INTEGER,
            DTLANC TEXT,
            FALTA NUMERIC,
            NUMLOTE INTEGER,
            NUMOP INTEGER,
            PRODUTO TEXT,
            QTPRODUZIDA NUMERIC,
            QTPRODUZIR NUMERIC,
            SECAO TEXT
        )
    ''')
    cursor.execute("SELECT * FROM ordens_aberta")
    dados = cursor.fetchall()
    cursor.close()
    return dados

def fechar_ordem(num_ordem):
    conn = sqlite3.connect(dbMain)
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM ordens_aberta
        WHERE NUMOP = ?
    """, (num_ordem,))
    conn.commit()
    conn.close()
    
def reduzir_quantidade(quantidade, num_ordem):
    conn = sqlite3.connect(dbMain)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE ordens_aberta
        SET QTPRODUZIDA = QTPRODUZIDA + ?, FALTA = FALTA - ?
        WHERE NUMOP = ?
    """, (quantidade, quantidade, num_ordem))
    conn.commit()
    conn.close()
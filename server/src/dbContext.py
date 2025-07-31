import sqlite3

dbMain = "db\\dbMain.db"

def initDb():
    conn = sqlite3.connect(dbMain)    
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lancamentos(
            num_ordem INTEGER NOT NULL,
            num_lote INTEGER NOT NULL,
            cod_produto INTEGER NOT NULL,
            nome_produto TEXT NOT NULL,
            quantidade_prevista INTEGER NOT NULL,
            lancamento INTEGER NOT NULL,
            falta INTEGER NOT NULL,
            tipo_lancamento TEXT NOT NULL,
            supervisor TEXT NOT NULL,
            operador TEXT NOT NULL,
            observacao TEXT,
            finalizado BOOLEAN NOT NULL DEFAULT 0,
            id_lancamento TEXT NOT NULL
        )               
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            admin BOOLEAN
        )               
    """)
    conn.close()
    
def select_lancamento():
    conn = sqlite3.connect(dbMain)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM lancamentos")
    dados = cursor.fetchall()
    cursor.close()
    return dados

def insert_lancamento(num_ordem, 
                      num_lote, 
                      cod_produto, 
                      nome_produto, 
                      quantidade_prevista, 
                      lancamento, 
                      falta,
                      tipo_lancamento, 
                      supervisor, 
                      operador, 
                      observacao,
                      id_lancamento):
    conn = sqlite3.connect(dbMain)
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT INTO lancamentos (num_ordem, 
                            num_lote,
                            cod_produto, 
                            nome_produto, 
                            quantidade_prevista, 
                            lancamento, 
                            falta,
                            tipo_lancamento, 
                            supervisor, 
                            operador, 
                            observacao,
                            finalizado,
                            id_lancamento) 
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
""", (num_ordem, 
      num_lote, 
      cod_produto, 
      nome_produto, 
      quantidade_prevista, 
      lancamento, 
      falta,
      tipo_lancamento, 
      supervisor, 
      operador, 
      observacao,
      False,
      id_lancamento
      ))
    
    conn.commit()
    conn.close()
    
def registrar_usuarios(username, password, admin):
    conn = sqlite3.connect(dbMain)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (username, password, admin) VALUES(?,?,?)
    """, (username, password,admin))
    conn.commit()
    cursor.close()
    
def apagarLancamentos():
    conn = sqlite3.connect(dbMain)
    cursor = conn.cursor()
    cursor.execute("""
        DROP TABLE IF EXISTS lancamentos;
    """)
    
    conn.commit()
    cursor.close()
    
def select_users():
    conn = sqlite3.connect(dbMain)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    data = cursor.fetchall()
    return data

def verificar_usuario_existente(username):
    data = select_users()
    
    response = next((i for i in data if username in tuple(i)), None)
        
    return response

def autenticar_usuario(username, password):
    userExist = verificar_usuario_existente(username)
    
    if not userExist:
        return False, 0
        
    
    response = False

    if userExist:
        if password in tuple(userExist):
            response = True
        
    return response, userExist[3]

def finalizar(finalizado, id_lancamento):
    conn = sqlite3.connect(dbMain)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE lancamentos SET finalizado = ?
        WHERE id_lancamento = ?          
    """, (finalizado, id_lancamento))
    conn.commit()
    conn.close()
from app import app
from flask import request, redirect, url_for, abort, jsonify, sessions, session, send_file
import pandas as pd
from src import dbContext, ordensAberta
import json

secret_key = "Al010306*"

@app.route("/api/lancamento", methods=['POST', 'PUT'])
def lancamento():
    data = request.get_json()

    dbContext.insert_lancamento(
        num_ordem=data.get('num_ordem'),
        num_lote=data.get('num_lote'),
        cod_produto=data.get('cod_produto'),
        nome_produto=data.get('nome_produto'),
        quantidade_prevista=data.get('quantidade_prevista'),
        lancamento=data.get('lancamento'),
        falta=data.get('falta'),
        tipo_lancamento=data.get('tipo_lancamento'),
        supervisor=data.get('supervisor'),
        operador=data.get('operador'),
        observacao=data.get('observacao'),
        id_lancamento=data.get("id_lancamento")
    )
    
    if data.get('tipo_lancamento') == "finalizado":
        ordensAberta.fechar_ordem(data.get("num_ordem")) 
    else:
        ordensAberta.reduzir_quantidade(data.get("lancamento"), data.get("num_ordem"))    
    
    return jsonify({"message": "Lançamento registrado com sucesso!"}), 201


@app.route("/view/lancados", methods=['GET'])
def lancados():
    data = dbContext.select_lancamento()
 
    json_data = [
        {
            "num_ordem": item[0],
            "num_lote": item[1],
            "cod_produto": item[2],
            "nome_produto": item[3],
            "quantidade_prevista": item[4],
            "lancamento": item[5],
            "falta": item[6],
            "tipo_lancamento": item[7],
            "supervisor": item[8],
            "operador": item[9],
            "observacao": item[10],
            "finalizado": item[11],
            "id_lancamento": item[12]
        }
        for item in data
    ]

    return jsonify(json_data)

@app.route('/view/ordens-aberta', methods=['GET'])
def ordensAbertas():
    data = ordensAberta.select_ordens_aberta()
    
    json_data = [
        {
            "CODPROD": item[0],
            "DTLANC": item[1],
            "FALTA": item[2],
            "NUMLOTE": item[3],
            "NUMOP": item[4],
            "PRODUTO": item[5],
            "QTPRODUZIDA": item[6],
            "QTPRODUZIR": item[7],
            "SECAO": item[8],
        }
        for item in data
    ]
    
    return jsonify(json_data)

@app.route("/atualizar_ordens_aberta", methods=['POST'])
def atualizar_ordens_aberta():
    file = request.files.get("file")
    
    file.save("C:\\Users\\Supra\\Desktop\\PCP-Supra\\server\\utils\\ordens_aberta.xls")
    response = ordensAberta.puxar_ordens_aberta()
    
    if (response):
        return jsonify({"status": "sucesso ao atualizar ordens em aberta"})
    else:
        return jsonify({"status": "Erro au atualizar ordens em aberto"})
    
# PAGES ROUTE ----------------------------------------------------------------------------

# -----------------------------------------------------------------------------------------

@app.route('/api/registrar-usuario', methods=['POST'])
def registrar_usuarios():
    request_json = request.get_json()
    username = request_json.get("username").lower()
    password = request_json.get("password")
    admin = False
    #------
    
    existe_usuario = dbContext.verificar_usuario_existente(username)
    
    if existe_usuario:
        return jsonify({"status": "Usuario já existe"})
    #------
    
    dbContext.registrar_usuarios(username, password, admin)
    
    return jsonify({"status": "Usuario criado com sucesso"})
    
@app.route('/api/trocar-senha')
def trocar_senha():
    pass

@app.route('/api/login', methods=['POST'])
def login():
    jsonData = request.get_json()
    
    username = jsonData.get("username")
    password = jsonData.get("password")
    
    response, isAdmin = dbContext.autenticar_usuario(username, password)
    
    return jsonify({"success": response, "isAdmin?": isAdmin})

@app.route('/api/verificar_usuario', methods=['POST'])
def verificar_usuario():
    pass

@app.route('/api/finalizar', methods=['POST'])
def finalizar():
    data = request.get_json()
    
    finalizado = data.get("finalizar")
    id_lancamento = data.get("num_op")
    
    print(id_lancamento)
    
    if finalizado:
        dbContext.finalizar(finalizado, id_lancamento)
        return {"mensagem": "ok"}
    else:
        return {"mensagem": "error"}
    

@app.route("/usuarios", methods=["POST"])
def usuarios():
    jsonRequest = request.get_json()
    if jsonRequest.get("secret_key") != secret_key:
        return jsonify({"status": "secret_key incorreta"})
    data = dbContext.view_usuarios()
    
    data_json = [
        {
            "id": item[0],
            "username": item[1]
        }
        for item in data
    ]    
    return jsonify(data_json)

@app.route("/delete-user", methods=["POST"])
def deletar_usuario():
    jsonRequest = request.get_json()
    
    if jsonRequest.get("secret_key") != secret_key:
        return jsonify({"status": "secret_key incorreta"})
    
    dbContext.deletar_usuario(jsonRequest.get("id_user"))
    return jsonify({"status": "usuario deletado"})
    
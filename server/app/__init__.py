from flask import Flask
from flask_cors import CORS
from src import dbContext

app = Flask(__name__)
CORS(app)

dbContext.initDb() 

from app import services
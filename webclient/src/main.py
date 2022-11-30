from flask import Flask, request, jsonify
from pymongo import MongoClient
from db_data import init_db, call_db


app = Flask(__name__)
client = MongoClient('mongodb://localhost:27017')


@app.route('/')
def index():
    return jsonify(client.list_database_names())


@app.route('/temps')
def database():
    db = call_db(client=client)
    weather = db.find_one()
    data = weather['data']

    return jsonify(data)

@app.route('/test')
def test_database():
    db = init_db(client=client)
    weather = db.find_one()
    data = weather['data']

    return jsonify(data)

@app.route('/drop')
def drop_database():
    db = call_db(client=client)
    db.drop()

    return {
        'message': "Database dropped", 
        'status_code': 201
    }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)

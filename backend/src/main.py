"""
Weather API
"""
import os
import json
import logging
import requests
import socket
from apscheduler.schedulers.background import BlockingScheduler
from contextlib import contextmanager
from mysql import connector as db
from pymongo import MongoClient


logging.basicConfig(
    format='[%(asctime)s] - - %(levelname)s - - %(message)s', 
    datefmt='%m/%d/%Y %I:%M:%S %p', 
    level=logging.DEBUG
    )
hostname = socket.gethostname()

CONFIG = {
    'user': os.getenv('MYSQL_USER', 'openapi'), 
    'password': os.getenv('MYSQL_PASSWORD', 'password'), 
    'host': os.getenv('MYSQL_HOST', '127.0.0.1'), 
    'port': os.getenv('MYSQL_PORT', 3306), 
    'database': os.getenv('MYSQL_DATABASE', 'weather')
    # 'auth_plugin': 'caching_sha2_password'
}
MDB_USER = os.getenv('MONGO_INITDB_ROOT_USERNAME', 'root')
MDB_PASS = os.getenv('MONGO_INITDB_ROOT_PASSWORD', 'mongroot')
MDB_HOST = os.getenv('MONGO_HOST', 'localhost')
MDB_PORT = os.getenv('MONGO_PORT', 27017)

MDB_URI = f'mongodb://{MDB_USER}:{MDB_PASS}@{MDB_HOST}:{MDB_PORT}'
client = MongoClient(MDB_URI)


@contextmanager
def connect(**kwargs):
    connection = db.connect(**kwargs)
    try:
        yield connection

    finally:
        connection.close()

def get_data() -> dict:
    with connect(**CONFIG) as cnx:
        crs = cnx.cursor()
        crs.execute('''SHOW TABLES;''')
        tables = crs.fetchall()
        data = list()
        print(tables)
        for table in tables:
            if table[0] != 'accounts':
                day = dict()
                tablename = table[0]
                filename = tablename.rsplit('_', 1)[1]
                day['datetime'] = filename
                crs.execute(f'''SELECT * FROM {tablename};''')
                raw_data = crs.fetchall()
                temp_range = dict()
                for row in raw_data:
                    temp_range[row[1]] = row[2]
                day['temp_range'] = temp_range
                data.append(day)
        # 
    return data


def process(data) -> list:
    processed_data = list()
    for day in data:
        values = day['temp_range']
        count = 0
        buffer = 0
        temp_list = list()
        for value in values.values():
            temp = float(value)
            temp_list.append(temp)
            buffer += temp
            count += 1
        day['temp_avg'] = round(buffer/count, 2)
        day['temp_max'] = max(temp_list)
        day['temp_min'] = min(temp_list)
        # 
        processed_data.append(day)
    
    return processed_data


def store_(data):
    mdb = client["weather"]
    collection = mdb["day"]
    try:
        ids = collection.insert_many(data)
        logging.info(f"Database updated with {len(ids.inserted_ids)} records")
    except TypeError as e:
        logging.warning(f"Database empty. {e}")

def init_db():
    mdb = client["weather"]
    collection = mdb["day"]
    collection.drop()

def query_():
    mdb = client["weather"]
    collection = mdb["day"]
    for day in collection.find():
        logging.info(day)

def run():
    init_db()
    data = get_data()
    days = process(data)
    store_(days)


def main():
    sched = BlockingScheduler()
    sched.add_job(run, 'interval', seconds=20)
    sched.start()


if __name__ == '__main__':
    main()

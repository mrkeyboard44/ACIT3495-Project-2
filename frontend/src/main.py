"""
Weather API admin portal
"""
import logging
import socket
from contextlib import contextmanager
from flask import Flask, render_template, request
from mysql import connector as db
from pymongo import MongoClient


CONFIG = {
    'user': 'admin', 
    'password': 'temp', 
    'host': '127.0.0.1', 
    'port': 3306, 
    'database': 'weather', 
    'auth_plugin': 'caching_sha2_password'
}
logging.basicConfig(
    format='[%(asctime)s] - - %(levelname)s - - %(message)s', 
    datefmt='%m/%d/%Y %I:%M:%S %p', 
    level=logging.DEBUG
    )
hostname = socket.gethostname()
app = Flask(__name__)
client = MongoClient('mongodb://root:mongroot@localhost:27017')

@contextmanager
def connect(**kwargs):
    connection = db.connect(**kwargs)
    try:
        yield connection

    finally:
        connection.close()

# Database connection
def test_connect(user: str, password: str, host: str, port: int, database: str, auth_plugin: str):
    with connect(user=user, password=password, host=host, port=port, database=database, auth_plugin=auth_plugin) as cnx:
        crs = cnx.cursor()
        try:
            crs.execute('''SHOW VARIABLES like 'version';''')
            version = crs.fetchone()
            logging.info(f"Connected to {database} database - MySQL {version[0]} {version[1]}")
            # 
        except Exception as e:
            logging.error(str(e))

        finally:
            crs.close()

# Database utilities
def init_table(connection, cursor, filename):
    create_table = f'''
        CREATE TABLE temp_{filename}
        (id_ INT NOT NULL AUTO_INCREMENT,
        time VARCHAR(100) NOT NULL,
        temp VARCHAR(250) NOT NULL,
        CONSTRAINT temp_{filename}_pk PRIMARY KEY (id_));
        '''
    try:
        cursor.execute(create_table)
        connection.commit()
    except Exception as e:
        raise

def add_to_db(connection, cursor, filename, data):
    insert_data = f'''
        INSERT INTO temp_{filename} (time, temp) VALUES ('{data[0]}', '{data[1]}');
        '''
    try:
        cursor.execute(insert_data)
        connection.commit()
    except Exception:
        raise


@app.route('/', methods=['GET','POST'])
def home():
    if request.method == 'POST':
        file = request.files['data']
        filename = file.filename.split('.', 1)[0]
        row_list = file.read().decode('utf-8').splitlines()
        # 
        with connect(**CONFIG) as cnx:
            crs = cnx.cursor()
            try:
                init_table(cnx, crs, filename)
                for row in row_list:
                    line = row.split(sep=',')
                    add_to_db(cnx, crs, filename, line)
                # 
            except Exception as e:
                logging.error(str(e))
            finally:
                crs.close()

        return render_template('readout.html', filename=file.filename, hostname=hostname)

    elif request.method == 'GET':
        return render_template('index.html', hostname=hostname)

@app.route('/admin')
def admin():
    filename = None
    data = None
    with connect(**CONFIG) as cnx:
            crs = cnx.cursor()
            try:
                crs.execute('''SHOW TABLES;''')
                tables = crs.fetchall()
                logging.info(len(tables))
                data = list()
                for t in tables:
                    tablename = t[0]
                    filename = tablename.rsplit('_', 1)[1]
                    
                    crs.execute(f'''SELECT * FROM {tablename};''')
                    raw_data = crs.fetchall()
                    
                    table = dict()
                    table['filename'] = filename
                    
                    day = list()
                    for row in raw_data:
                        hour = {'time': row[1], 'temp': row[2]}
                        day.append(hour)
                    
                    table['data'] = day
                    data.append(table)
                # 
            except Exception as e:
                logging.error(str(e))
            finally:
                crs.close()
    
    return render_template('admin.html', filename=filename, data=data)

@app.route('/view')
def view():
    mdb = client["weather"]
    collection = mdb["day"]
    data = list()
    for day in collection.find():
        view = dict()
        view['datetime'] = day['datetime']
        view['temp_avg'] = day['temp_avg']
        view['temp_max'] = day['temp_max']
        view['temp_min'] = day['temp_min']
        data.append(view)
    
    return render_template('view.html', data=data)


def main() -> None:
    test_connect(**CONFIG)
    app.run(host='0.0.0.0', port=8080, debug=True)


if __name__ == '__main__':
    main()

from datetime import datetime as dtg

date = dtg.date(dtg.today())
data = {
    'data': {
        'datetime': f'{date}', 
        'temp_avg' : 22.2, 
        'temp_high': 26.1, 
        'temp_low' : 18.4, 
        'temp_range': {
            '00:00': 18.4, 
            '01:00': 18.6, 
            '02:00': 18.9, 
            '03:00': 19.1, 
            '04:00': 19.4, 
            '05:00': 19.8, 
            '06:00': 20.4, 
            '07:00': 21.6, 
            '08:00': 22.4, 
            '09:00': 23.8, 
            '10:00': 24.4, 
            '11:00': 25.2, 
            '12:00': 26.1, 
            '13:00': 25.6, 
            '14:00': 24.5, 
            '15:00': 23.2, 
            '16:00': 22.6, 
            '17:00': 22.3, 
            '18:00': 21.0, 
            '19:00': 20.3, 
            '20:00': 19.7, 
            '21:00': 19.2, 
            '22:00': 18.6, 
            '23:00': 18.4, 
            '24:00': 18.2
            }
        }
    }


def call_db(client):
    db = client["temps"]
    collection = db["temp_data"]
    
    return collection

def init_db(client):
    db = client["temps"]
    collection = db["temp_data"]
    collection.insert_one(data)

    return collection

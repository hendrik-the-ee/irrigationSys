#!/usr/local/bin/python3.6

import sqlite3
import sys
import os

def main():
    if len(sys.argv) != 3:
        print("usage: <log filename> <db name>")
        sys.exit(0)
    filename = sys.argv[1]
    db_name = sys.argv[2]

    if not os.path.exists(filename):
        print("please enter a valid filename")
        sys.exit(0)

    if not os.path.exists(db_name):
        print("db does not exist")
        sys.exit(0)

    if not db_name.endswith('.db'):
        print("please enter a valid db name")
        sys.exit(0)

    conn = sqlite3.connect(db_name)
    c = conn.cursor()

    with open(filename, 'r') as f:
        # read through lines, skipping anything with msg=ping or user_agent=curl
        for line in f:
            if not "info" in line:
                print("not an info log")
                continue
            data = line.strip().split('info ')[1].split(' ')
            if len(data) == 9:
                user_agent = data[7].split('[')[1].strip(']"')
                if user_agent == 'ESP32HTTPClient':
                    time = line.split(': ')[1].split('" level')[0].strip('time="')
                    sensor_id = data[2].split('=')[1]
                    sensor_type = data[3].split('=')[1]
                    soil_moisture = data[5].split('=')[1]
                    soil_temp = data[6].split('=')[1]
                    volts_in = data[8].split('=')[1]
                    # sensor_id, sensor_type, temp, moist, volts_in, created_at
                    c.execute(
                        '''INSERT INTO sensor_data
                        (sensor_id, sensor_type, temp, moist, volts_in, created_at, can_delete)
                        VALUES (?,?, ?, ?, ?, ?, ?)''',
                        (sensor_id, sensor_type, soil_temp, soil_moisture, volts_in, time,0),
                    )
                    print(c.lastrowid)
                    conn.commit()
    conn.close()

if __name__ == "__main__":
    main()

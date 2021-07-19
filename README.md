# irrigationSys
general design, code and firmware for an expandable IOT irrigation system

## Deploy Steps
1. ssh into pi
2. `sudo systemctl stop collector`
3. `./scripts/up.sh`
4. Manually update env vars in systemctl file and reload 
`/lib/systemd/system/$SERVICE_NAME.service` and `sudo systemctl daemon-reload`
6. `sudo systemctl start collector`
7. `sudo systemctl status collector`
8. Send test curl to ensure everything is working. Use 22 as the id.
`curl $PI_IP:8080/data -d '{"sensor_id":22, "temp": 498.0}'`

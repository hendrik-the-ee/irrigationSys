# irrigationSys
general design and firmware for an expandable IOT irrigation system

## Deploy Steps
1. ssh into pi
2. `sudo systemctl stop collector`
3. `./scripts/up.sh`
4. `sudo systemctl start collector`
5. `sudo systemctl status collector`
6. Send test curl to ensure everything is working. Use 22 as the id.
`curl $PI_IP:8080/data -d '{"sensor_id":22, "temp": 498.0}'`

# baosotrung-server
nginx config

nano /etc/nginx/conf.d/nginx.conf 
include conf.d/http;

nano /etc/nginx/conf.d/http
server {
    listen 80;
    server_name baotrungso.com www.baotrungso.com;
    root /home/hvb/baosotrung-server/public;

    location /api/ {
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   Host $http_host;
        proxy_pass         http://localhost:9067;
    }
}


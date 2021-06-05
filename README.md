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

How to deal with missing sites-available in nginx directory
https://stackoverflow.com/questions/17413526/nginx-missing-sites-available-directory

Create sites-available
https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04

How to use certbot to receive https traffic
https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04

# baosotrung-server

nginx config

cd /etc/nginx/sites-available
sudo nano baotrungso.com
sudo systemctl reload nginx

server {
server_name baotrungso.com www.baotrungso.com;
root /home/hvb/baosotrung-server/public;

    location /api/ {
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   Host $http_host;
        proxy_pass         http://localhost:9067;
    }

    location /sodo {
        try_files $uri.html $uri =404;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/baotrungso.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/baotrungso.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
if ($host = www.baotrungso.com) {
        return 301 https://$host$request_uri;
} # managed by Certbot

    if ($host = baotrungso.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name baotrungso.com www.baotrungso.com;
    return 404; # managed by Certbot

}

How to deal with missing sites-available in nginx directory
https://stackoverflow.com/questions/17413526/nginx-missing-sites-available-directory

Create sites-available
https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04

How to use certbot to receive https traffic
https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04

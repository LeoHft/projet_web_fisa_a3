#!/bin/sh
set -e


echo 'Vérification des certificats SSL...'
mkdir -p ./

if [ -f ./certificate.crt ] && [ -f ./private.key ]; then
  echo 'Certificats SSL trouvés!'
  exit 0
fi

echo 'Génération des certificats SSL manquants...'

cat > ./openssl.conf << 'EOF'
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=FR
ST=Grand Est
L=Strasbourg
O=Breezy Development
OU=IT Department
CN=breezy.hofstetterlab.ovh

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = www.localhost
DNS.3 = 127.0.0.1
DNS.4 = breezy.local
DNS.5 = breezy.hofstetterlab.ovh
DNS.6 = www.breezy.hofstetterlab.ovh
IP.1 = 127.0.0.1
IP.2 = ::1
IP.3 = 192.168.1.177
EOF

openssl genrsa -out ./private.key 2048
openssl req -new -x509 -key ./private.key -out ./certificate.crt -days 365 -config ./openssl.conf -extensions v3_req

chmod 644 ./private.key
chmod 644 ./certificate.crt

echo 'Certificats générés !'

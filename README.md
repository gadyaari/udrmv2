# UDRM

## Preqrequisites
* any version of node
* npm installed
* c++ compiler (for Ubuntu the build-essential and libssl-dev packages work.).

## Clone repository
```
git clone https://github.com/kaltura/udrmv2.git
```

## Install nvm

```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash
```

or Wget:

```sh
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash
```

### Install relevant node version
```
cd udrmv2
```

```nvm install```

You can see the node version in .nvmrc

## Get necessary node packages
```
cd udrmv2
```

```
npm install
```

## Setup service script
```
cp scripts/kaltura_udrm.template.sh /etc/init.d/kalutra-udrm
```

Edit the file /etc/init.d/kalutra-udrm.sh:

* Replace the value of @UDRM_SERVER_BASE_DIR@ with the directory of the code.
* Replace the value of @LOG_DIR@ with your log directory. 

## UDRM config
```
cp config/config.ini.template config/config.ini
```

```
cp config/udrm.ini.template config/udrm.ini
```

Set all relevant fields in new ini files.

## Run UDRM
To start the server

```
service kaltura-udrm start
```

To stop the server

```
service kaltura-udrm stop
```

To restart the server

```
service kaltura-udrm restart
```


To check the server status

```
service kaltura-udrm status
```

##Picture of Concepcion volcano

![Alt text](./concepcion.jpg?raw=true "Concepcion")

Copyright © Kaltura Inc. All rights reserved.

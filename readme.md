# ShareTaxi

## Group Members
* A0091372H Naomi Leow Wen Xin
* A0116208N Yeo Zi Xian, Justin (PM)
* A0113627L Ding Xiang Fei

## Contributions
### Naomi: ###
* Full Stack Developer
* Set up (boilerplating)
* Front-end functionality (linking to backend)
* Deployment

### Justin: ###
* Front-end Developer
* Design (UI/UX, Icon/Splashscreen/Tutorial)
* Documentation/Reports

### Xiang Fei: ###
* Back-end Developer
* Database set-up

# Developers:
## Directory Structure
- Frontend (Ionic) code is in sharetaxi/
- Backend (Laravel) code is in backend/

## General Setup:
1. You will need npm: http://blog.npmjs.org/post/85484771375/how-to-install-npm
2. PHP >= 5.5.9
3. The frontend and backend have to be started up individually

## Setting up Laravel:
1. Install Composer: http://getcomposer.org/

     > curl -sS https://getcomposer.org/installer | php

     > mv composer.phar /usr/local/bin/composer

2. Install Laravel installer
    > composer global require "laravel/installer=~1.1”
3. Install required dependencies
    > npm install
4. In backend/

    > composer install (to install dependencies)

    > php artisan key:generate

    > php artisan serve (to start Laravel)

## Setting up Ionic:
1. Install Cordova: (Make sure you have nodejs installed first)

    > sudo npm install -g cordova

2. Install ionic

    > sudo npm install -g ionic

3. Install required dependencies

    > npm install

4. In sharetaxi/

    > ionic serve (to start ionic)

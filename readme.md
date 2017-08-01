# schema-web-fcm

This is a frequence control manage plugin of schema-web, like filter in javaweb.

Using this plugin, you can easily to manage the frequency of any pattern url of your application. For example, if you hold an lottery application, you would like to set a limitation at api interface named 'lottery.apply' which some bad guy would call it using curl more than 100000 times in a minute. This module just implement two rule, based on ip or sessionId.
If memcached service is down, the middleware will not work, api still fine.

## Dependence

- memcached

## Terminology

- Gun Shooting Model : In a gun battle game, the gatlin has two status, one is normal status, the other is over hot. For example, the gatlin can shoot 30 times in 10s, if you shoot less than 30 in 10s, you can shoot all the time, but if you over 30 times, the gun will change normal status into over hot which it can`t not shoot between 20s in the future. After 20s, the status will go back to normal, and you could shoot again, but how many times you can shoot, dependence on your shooting history.
- Rule : Rule is the real worker for the limit task. Rule`s do method will check the limit condition, if the shooting times over the limit, Rule will set the status from normal to over hot. And in next time with status still is over hot, Rule will throw Error, as a result of client call the api, client get 500.

## Installation

	npm install schema-web-fcm

if you not install schema-web yet, you should run this

	npm install schema-web

## Usage

	const SchemaWeb = require('schema-web');
	const SchemaWebFcm = require('schema-web-fcm');

	SchemaWeb
	 .create({
	                 host: '127.0.0.1',
                	 port: 80,
                	 handlerDir: './handler/', //handler is dir hold api handle process
	                 logDir: './logs/web/' //specify log dir
	 })
	 .installMiddleware(new Middleware.SessionMiddleware('/*')) //another middleware of schemaweb, use to check session for some api need auth
	 .installMiddleware(new SchemaWebFcm.FCMMiddleware(
	 '/*',
	 [
        	 {
            	 pattern: '.*', //filter by all api, this is a regular expression
            	 rules:
                	 [
                	       new SchemaWebFcm.Rule.SessionRule(10000, 30, 20000)
                	 ]
        	 }
	 ],
	 [
			'127.0.0.1:11211' //specify server addr of memcached
	 ]
	 ))
	 .raise(); //start api service


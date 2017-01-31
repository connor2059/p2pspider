'use strict';

var P2PSpider = require('./lib');
var level = require('level');

var db = level('./leveldb');
var pg = require('pg');

var config = {  
    user:"test",
    database:"p2pdata",
    password:"test",
    port:5432,
    max:20, 
    idleTimeoutMillis:3000,
}

var pool = new pg.Pool(config);

var p2p = P2PSpider({
    nodesMaxSize: 200,   // be careful
    maxConnections: 400, // be careful
    timeout: 5000
});

p2p.ignore(function (infohash, rinfo, callback) {
    // console.log(infohash);
//console.log(rinfo);
    db.get(infohash, function (err, value) {
       
      //  console.log(err);
//console.log('value');
//console.log(value);
        if(value==undefined || value==null)
		{ callback(false);
	   // console.log('aaa');
		}
	    else 
		{callback(true);
	   // console.log('bbb');
		}
    });
});

p2p.on('metadata', function (metadata) {
	//console.log('ccc')
    // At here, you can extract data and save into database.
    //var name = metadata.info['name.utf-8'] ? metadata.info['name.utf-8'] : (metadata.info['name'] ? metadata.info['name'] : null);
    var fetchedAt = new Date().getTime();
    db.put(metadata.infohash, fetchedAt.toString(), function (err) {
        if(!err) {
			//console.log('eee')
            console.log(metadata.infohash);
        }
    });
pool.connect(function(err, client, done) {  
  if(err) {
    return console.error('connect error', err);
  }
 client.query('INSERT INTO metadata(raw,name,infohash,timestamps) values($1::bytea,$2::bytea,$3::char(40),$4::bigint)', [metadata.raw,metadata.name,metadata.infohash,fetchedAt], function(err, result) 
 {
    done();
    if(err) {
      return console.error('query error', err);
    }
  });
});
});
//var x=Buffer(0);
p2p.listen(6881, '0.0.0.0');

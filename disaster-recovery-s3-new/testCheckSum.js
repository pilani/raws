var AWS = require('aws-sdk');
var fs = require('fs');
var ONE_MB=1024*1024;
var crypto = require('crypto');
var async=require('async');
var numchunks=0;
var buff = new Buffer(1024*1024);
var algo = 'sha256';
var position=null;

//computeCheckSum();

exports.computeCheckSum=computeCheckSum;

function computeCheckSum(path){

    var sha256hashes=new Array(numchunks);
    var idx = 0;
    async.waterfall([function dummy(callback){callback(null, path,sha256hashes,idx);} ,computeNumChunks,readFile,calculateFinalChecksum],
        function(err,result ){
            if(err){
              // trackProcess("finalWaterfallCall","error in calling async.waterfall for account "+credentials+ " MESSAGE : "+err,gpId,"F");
                callback(err);
            }
            else{
                //trackProcess("finalWaterfallCall","final Iterator callback",gpId,"S");
                //callback();
            }
    });

}


function computeNumChunks(path,sha256hashes,idx,callback){
    console.log("inside computeNumChunks"+path);
   	fs.stat(path,function(err,data){
	   console.log(data.size);
	   var numchunks=Math.floor(data.size/ONE_MB);
	   console.log("numchunks before"+numchunks);
	   if(data.size % ONE_MB > 0){
		  numchunks++;
	   }
	   console.log("numchunks"+numchunks);
		//fs.read("/home/deepikajain/Desktop/10_144688_Panoramic.jpg",buffer,0,ONE_MB)
   	});
    fs.open(path,'r',function(err,fd){
        if(err){
            console.log("ERor"+err);
        }
        console.log("fd"+fd);
        //  readFile(null,fd);
        callback(null,position,fd,sha256hashes,idx);
    });
}
           
          
function readFile(position,fd,sha256hashes,idx,callback){
    fs.read(fd,buff,0,1024*1024,position,function(err,data,buffer){
        console.log("bytes read" + data);    
                     
        if(data>0){
            position=position+ONE_MB;
            var shasum = crypto.createHash(algo);
            shasum.update(buffer);
            sha256hashes[idx++]  = shasum.digest('hex');
            readFile(position,fd,sha256hashes,idx,callback);
        }
        else{
            console.log("done");
            console.log("final sha256hashes"+sha256hashes);
            callback(null,sha256hashes);
        }
                    
    });
}


function calculateFinalChecksum(sha256hashes,callback){
    console.log(sha256hashes.length);
    var prevlvlHashes=sha256hashes;
    //var cullLvlHashes=new Array(prevlvlHashes.length);
    while (prevlvlHashes.length > 1) {
        console.log("inside while");
        var len = Math.floor(prevlvlHashes.length / 2);
        console.log("initial length"+len);
        if (prevlvlHashes.length % 2 != 0) {
                len++;
        }
        var cullLvlHashes=new Array(prevlvlHashes.length);
        console.log("len"+len);
        var j = 0;
        for (var i = 0; i < prevlvlHashes.length; i = i + 2, j++) {
             // If there are at least two elements remaining
            console.log("sha256hashes.length - i"+(prevlvlHashes.length - i));
            if (prevlvlHashes.length - i > 1) {
                console.log("inside if");
                    // Calculate a digest of the concatenated nodes
                 var shasum = crypto.createHash(algo);
                 console.log("prevlvlHashes[i]"+prevlvlHashes[i]);
                 shasum.update(prevlvlHashes[i]);
      
                 cullLvlHashes[j] = shasum.digest('hex');
                 console.log("cullLvlHashes[j] after one iteration"+cullLvlHashes[j]);
            } else { // Take care of remaining odd chunk
                   cullLvlHashes[j] = prevlvlHashes[i];
                    console.log("inside else");
                }
            }
        prevlvlHashes=new Array();
        for(var i=0;i<cullLvlHashes.length;i++){
            if(cullLvlHashes[i]){
            prevlvlHashes.push(cullLvlHashes[i]);
            }
        }
        console.log("cullLvlHashes"+cullLvlHashes);
        console.log("prevlvlHashes......"+prevlvlHashes);
    }

    console.log("final array"+prevlvlHashes[0]);
    callback();
}

   

     /*var xxx=fs.createReadStream("/home/deepikajain/Desktop/10_144688_Panoramic.jpg",{'bufferSize': ONE_MB});
            console.log("xxx"+JSON.stringify(xxx));
             while ((bytesRead = fs.createReadStream("/home/deepikajain/Desktop/10_144688_Panoramic.jpg",{'bufferSize': ONE_MB})) > 0) {
        console.log("bytes read" + bytesRead);
               bytesRead.on('data', function(d) { shasum.update(d); });
                    bytesRead.on('end', function() {
                        chunkSHA256Hashes[idx++]  = shasum.digest('hex');
                            console.log("............."+chunkSHA256Hashes);
                    });
            }*/

                 // readFile(null,fd);
          /* while ((bytesRead = fs.read(fd,buff,0,1024*1024,null)) > 0) {
        console.log("bytes read" + bytesRead);
               bytesRead.on('data', function(d) { shasum.update(d); });
                    bytesRead.on('end', function() {
                        chunkSHA256Hashes[idx++]  = shasum.digest('hex');
                            console.log("............."+chunkSHA256Hashes);*/
                            

                          /*  var s=fs.createReadStream("/home/deepikajain/Desktop/10_144688_Panoramic.jpg").pipe(block);
                            console.log("SSSSSSS"+JSON.stringify(s));
                            s.on('data', function(d) {
                                console.log("size"+d.length);
                                var shasum = crypto.createHash(algo);
                                shasum.update(d); 
                                var sh = shasum.digest('hex');
                                console.log(" sum "+sh)
                                sha256hashes[idx++] =sh;            
                                 //var dp = shasum.digest('hex');
                                        //console.log("data"+sha256hashes);

                            });
                            s.on('end', function() {
                                 //sha256hashes[idx++]  = shasum.digest('hex');
                               // var dp = shasum.digest('hex');
                                        console.log("hit end of file"+sha256hashes);
                    });*/
                               //  });
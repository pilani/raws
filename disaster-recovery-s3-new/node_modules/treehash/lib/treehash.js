/*
 * The MIT License (MIT)
 * Copyright (c) 2012 Christopher Holt, (http://e-lite.org); Picturelife, LLC (http://picturelife.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
*/
var crypto = require('crypto');

function TreeHash () {
    var megabyte = 1024 * 1024;
    this.buffer = new Buffer(0);
    this.shas   = [];
    this.digested = false;
    this.update = function (chunk) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        while (this.buffer.length > megabyte) {
            var sha = crypto.createHash('sha256').update(this.buffer.slice(0,megabyte)).digest();
            this.shas.push(sha);
            this.buffer = this.buffer.slice(megabyte);
        }
    }

    this.digest = function () {
        if (this.digested) throw {"name": "Treehash error", "message" : "The treehash has already been digested."}
        var sha = crypto.createHash('sha256').update(this.buffer).digest();
        this.shas.push(sha);
        // reduce to one single sha to rule them all
        while (this.shas.length > 1) {
          var newShas = [];
          for (i=0; i<this.shas.length; i=i+2) {
              if (this.shas[i+1]) {
                  var sha = crypto.createHash('sha256').update(this.shas[i]).update(this.shas[i+1]).digest();
                  newShas.push(sha);
              } else {
                  newShas.push(this.shas[i]);
              }
            }
            this.shas = newShas;
        }
  
        // convert final sha digest to hex
        var hexSha = '';
        for(var i=0;i<this.shas[0].length;i++) {
            var hexChar = ''+this.shas[0].charCodeAt(i).toString(16);
            if (hexChar.length == 1) hexChar = "0"+hexChar
            hexSha += hexChar
        }

        this.digested = true;
        return hexSha;
    }
    return this;
};

exports.createTreeHashStream = function () { return new TreeHash()};

exports.getTreeHashFromBuffer = function(buffer) {
  var megabyte = 1024 * 1024;
  var shas = [];
  
  // calculate each megabyte's sha
  for(run=0;(run*megabyte) < buffer.length;run++) {
    var end = (run*megabyte)+megabyte > buffer.length ? buffer.length : (run*megabyte)+megabyte;
    var sha = crypto.createHash('sha256').update(buffer.slice((run*megabyte),end)).digest();
    shas.push(sha);
  }
  
  // reduce to one single sha to rule them all
  while (shas.length > 1) {
    var newShas = [];
    for (i=0; i<shas.length; i=i+2) {
      if (shas[i+1]) {
        var sha = crypto.createHash('sha256').update(shas[i]).update(shas[i+1]).digest();
        newShas.push(sha);
      } else {
        newShas.push(shas[i]);
      }
    }
    shas = newShas;
  }
  
  // convert final sha digest to hex
  var hexSha = '';
  for(var i=0;i<shas[0].length;i++) {
    var hexChar = ''+shas[0].charCodeAt(i).toString(16);
    if (hexChar.length == 1) hexChar = "0"+hexChar
    hexSha += hexChar
  }
  return hexSha;
}

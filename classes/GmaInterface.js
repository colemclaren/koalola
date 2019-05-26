var fs   = require('fs-extra');
var Long = require("long");
var Q    = require("q");
var crc  = require("crc");

module.exports = {
    /**
     * Parse a potential GMA file
     *
     * @param  {String} path
     * @return {GMAFile}
     */
    parseAddon: function(path, callback) {
        var deferred = Q.defer();
        //Our file exists, let's do this
        var gmaFile = new GMAFile();

        fs.readFile(path,{"flag": "r"},function(err,data) {
            if(data) {
				var pointer = 0;
				var d = data;
                gmaFile.header.identifier = d.toString("UTF-8", 0, 4);
                if (gmaFile.header.identifier == "GMAD") {
                    var walker = new FileWalker(d);
                    walker.pointer = 4; //Set our pointer starting location

                    gmaFile.header.version = walker.readInt();
                    gmaFile.steamId = walker.readLong();
                    gmaFile.timestamp = walker.readLong();

                    gmaFile.unusedString = walker.readString();

                    while (gmaFile.unusedString != "") {
                        gmaFile.unusedString += walker.readString();
                    }

                    gmaFile.name = walker.readString();
                    gmaFile.description = walker.readString();
                    gmaFile.author = walker.readString();

                    gmaFile.version = walker.readUInt();


                    //Retrieve fileList
                    var fileNumber = 0;
                    var fileOffsetPointer = new Long();

                    while (walker.readUInt() != 0) {
                        var gmaFileEntry = new GMAFileEntry();
                        gmaFileEntry.title = walker.readString();
                        gmaFileEntry.size = walker.readLong();
                        gmaFileEntry.crc = walker.readUInt();
                        gmaFileEntry.offset = fileOffsetPointer;
                        gmaFileEntry.fileNumber = fileNumber;

                        gmaFile.fileList.push(gmaFileEntry);
                        fileOffsetPointer = fileOffsetPointer.add(gmaFileEntry.size);
                        fileNumber++;
                    }

                    gmaFile.fileDataOffset = walker.pointer;
                    deferred.resolve(gmaFile);
                } else {
                    deferred.reject("Bad Header!");
                }
            } else if(err) {
                deferred.reject("File Error: " + err);
            }
        });
        deferred.promise.nodeify(callback);
        return deferred.promise;
    },
    /**
     * Extract a file from a GMA
     *
     * @param  {String} addonPath
     * @param  {GMAFile} addon
     * @param  {int} fileId
     * @return {ExtractionStatus}
     */
    extractFileFromAddon: function(addonPath,addon,fileId,callback) {
        var deferred = Q.defer();
        var extraction = new ExtractionStatus();

        extraction.source = addonPath;
        extraction.destination = addonPath.replace(".gma","") + "/" + addon.fileList[fileId].title;

        fs.readFile(extraction.source,{"flag": "r"},function(err,data) {
            if(data) {
				var outputFile = fs.createOutputStream(extraction.destination);

                outputFile.on('close',function() {
                    if(extraction.success)
                        deferred.resolve(extraction);
                    else
                        deferred.reject(extraction);
                });
                outputFile.on('open',function() {
                    extraction.stats.bytesRead = data.length;

                    var offset = new Long();
                    offset = offset.add(addon.fileList[fileId].offset);
                    offset = offset.add(addon.fileDataOffset);

                    var size = new Long();
                    size = size.add(addon.fileList[fileId].size);
                    size = size.add(offset);

                    var writeData = data.slice(offset,size);

                    if(addon.fileList[fileId].crc == crc.crc32(writeData)) {
                        outputFile.write(writeData);
                        extraction.stats.bytesWritten = writeData.length;
                        extraction.success=true;
						outputFile.end();
                    } else {
                        extraction.message = "CRC Mismatch "+addon.fileList[fileId].crc + " =/= " + crc.crc32(writeData);
                        outputFile.end();
                    }
                });
            } else if(err) {
                extraction.message = "File Error: " + err;
                deferred.reject(extraction);
            }
        });
        deferred.promise.nodeify(callback);
        return deferred.promise;
    }
};

//Walk our file, maintaining pointer location
var FileWalker = function(buffer) {
    this.pointer=0;
    this.buffer = buffer;
    this.readData = function(type) {
        switch(type) {
            case "string":
                var startingPoint = this.pointer;
                for (var i = this.pointer; i < buffer.length-1; i++){
                    this.incrementPointer();
                    if(buffer[i] == "0") {
                        return buffer.toString("UTF-8",startingPoint,i);
                    }
                }
                break;
            case "long":
                var longLow = buffer.readInt32LE(this.pointer,4);
                var longHigh= buffer.readInt32LE(this.pointer+4,4);
                this.incrementPointer(8);
                return Long.fromBits(longLow,longHigh);
                break;
            case "uint":
                var theInt = buffer.readUIntLE(this.pointer,4);
                this.incrementPointer(4);
                return theInt;
                break;
            case "int":
                var theInt = buffer.readIntLE(this.pointer,1);
                this.incrementPointer();
                return theInt;
                break;
        }
    }

    this.readString = function() {
        return this.readData("string");
    }

    this.readLong = function() {
        return this.readData("long");
    }

    this.readInt = function() {
        return this.readData("int");
    }

    this.readUInt = function() {
        return this.readData("uint");
    }

    this.incrementPointer = function(count) {
        if(!count)
            this.pointer++;
        else
            this.pointer+=count;
    }
}

//GMA File Structure
var GMAFile = function() {
    this.header = {
        "identifier": "",   //Should always be GMAD
        "version": ""       //Always 3 according to GMAD
    }
    //Metadata
    this.steamId        =   new Long(); //SteamId of the addon creator
    this.timestamp      =   new Long(); //Unix timestamp
    this.unusedString   =   "";         //String data, presently unused
    this.name           =   "";         //Name of the Addon
    this.description    =   "";         //This may be JSON or a blurb containing bbcode
    this.author         =   "";         //Doesn't appear to be set properly, always "author" or "Author Name"
    this.version        =   "";         //Addon version, GMAD states its not used right now

    //Filedata
    this.fileDataOffset =   new Long(); //Offset where file data starts
    this.fileList       =   [];         //Array of GMAFileEntry
}

//GMA File Table Structure
var GMAFileEntry = function() {
    this.title          =   "";             //File path
    this.size			=   new Long();     //Size of file
    this.crc			=   new Long();     //CRC of file
    this.offset		    =   new Long();     //Offset indicating where file data starts
    this.fileNumber	    =   0;              //Number in list @TODO Do we even need this?
}

//Template for extraction result
var ExtractionStatus = function() {
    this.source         =   "";
    this.destination    =   "";
    this.success        =   false;
    this.message        =   "";

    this.stats = {
        "bytesRead": 0,
        "bytesWritten": 0
    }
}
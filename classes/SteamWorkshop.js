var fs = require('fs');
var path = require('path');
var request = require('request');
var lzma = require('lzma-native');

var FILE_URL = "http://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v0001/";
var COLLECTION_URL = "http://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v0001/";

var SteamWorkshop = function (folder) {
  this.folder = folder;
};

/* Prepare request payload */

SteamWorkshop.prepareCollectionData = function (ids) {
  return {
    format: 'json',
    collectioncount: ids.length,
    publishedfileids: ids,
  };
};

SteamWorkshop.prepareFilesData = function (ids) {
  return {
    format: 'json',
    itemcount: ids.length,
    publishedfileids: ids,
  };
};

/* Load data from Steam Workshop API */

SteamWorkshop.prototype.loadCollectionData = function (requestData, cb) {
  request.post(COLLECTION_URL, {form: requestData}, function (err, resp, body) {
    if (err) {
      cb(err);
      return;
    }

    var data;

    try {
      data = JSON.parse(body);
    } catch (e) {
      cb(e);
      return;
    }

    if (!data || !data.response || !data.response.collectiondetails) {
      cb(new Error("No data found"));
      return;
	}
	console.log(data.response.collectiondetails.map(c => c.children).reduceRight((a, b) => a.concat(b)).map(a => a.publishedfileid));

    var fileIds = data.response.collectiondetails.map(function (collection) {
      if (!collection.children) {
        return [];
      }

      return collection.children.map(function (file) {
        return file.publishedfileid;
      });
    }).reduce(function(a, b) {
      return a.concat(b);
    });
    cb(null, fileIds);
  });
};

SteamWorkshop.prototype.loadFilesData = function (requestData, cb) {
  request.post(FILE_URL, {form: requestData}, function (err, resp, body) {
    if (err) {
      cb(err);
      return;
    }

    var data;

    try {
      data = JSON.parse(body);
    } catch (e) {
      cb(e);
      return;
    }

    if (!data || !data.response || !data.response.publishedfiledetails) {
      cb(new Error("No data found"));
      return;
    }

    var files = data.response.publishedfiledetails;
    cb(null, files);
  });
};

/* Actual file download */

SteamWorkshop.prototype.saveFileToDisk = function (file, folder, cb) {
  var decompressor = lzma.createDecompressor();
  let dapath = path.join(folder, file.publishedfileid + ".gma")

  var f = fs.createWriteStream(dapath)
    .on('error', function(err) {
      //console.error(e)
      cb("Error while executing " + file.publishedfileid)
    })
    .on('finish', function() {
      if (cb) {
        cb()
      }
    });

  request(file.file_url)
    .on('error', function(err) {
      //cb(err);
    })
    .on('finish', function() {
      console.log(file.title)
    })
    .pipe(decompressor)
    .on('error', function(e){ 
      //console.error(e) 
      cb("Error while executing " + file.publishedfileid) 
    }).pipe(f)
    .on('error', function(e){
      //console.error(e)
      cb("Error while executing " + file.publishedfileid)
    });
};

SteamWorkshop.prototype.saveFilesToDisk = function (files, folder, cb) {
  var self = this;

  if (files.length > 1) {
    cb("Found " + files.length + " addons, downloading now.", true);
  } else {
    cb("Found addon, downloading now.", true);
  }

  let succ_files = 0;
  var numfiles;

  for (numfiles = 0; numfiles < files.length; numfiles++) {
    let file = files[numfiles]
	
    if (file && file.file_url && file.filename && (file.filename.endsWith(".gma") || file.filename.endsWith(".gm"))) {
      succ_files++;

      if (numfiles + 1 == files.length) {
        self.saveFileToDisk(files[numfiles], folder, cb);
      } else {
        self.saveFileToDisk(files[numfiles], folder);
      }
    }

    if (numfiles + 1 == files.length) {
      if (succ_files < 1) {
        cb("Couldn't find any gma files, perhaps you tried scanning a collection only?");
      }
    }
  }
};

/*
 * Download multiple files from Steam Workshop
 */
SteamWorkshop.prototype.downloadFiles = function (ids, cb) {
  var self = this;

  self.loadFilesData(SteamWorkshop.prepareFilesData(ids), function(err, files) {
    if (err) {
      cb(err);
    } else {
      self.saveFilesToDisk(files, self.folder, function (err, stop) {
        cb(err, files, stop);
      });
    }
  });
};

/*
 * Download single file from Steam Workshop
 */
SteamWorkshop.prototype.downloadFile = function (id, cb) {
  this.downloadFiles([id], cb);
};

/*
 * Download multiple collections from Steam Workshop
 */
SteamWorkshop.prototype.downloadCollections = function (ids, cb) {
  var self = this;

  self.loadCollectionData(SteamWorkshop.prepareCollectionData(ids), function(err, fileIds) {
    if (err) {
      cb(err);
    } else {
      self.downloadFiles(fileIds, cb);
    }
  });
};

/*
 * Download single collection from Steam Workshop
 */
SteamWorkshop.prototype.downloadCollection = function (id, cb) {
  this.downloadCollections([id], cb);
};

module.exports = SteamWorkshop;


/*
var lzma = require('lzma-native');
var request = require('request');
var async = require('async');
var path = require('path');
var fs = require('fs');

var FILE_URL = "http://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/";
var COLLECTION_URL = "http://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/";

var GmodWorkshop = function (outputPath = 'addons') {
	this.outputPath = outputPath;
};

GmodWorkshop.prototype.getDetails = function (ids, isCollection = false) {
	return new Promise(function(resolve, reject) {
		request.post(`http://api.steampowered.com/ISteamRemoteStorage/Get${isCollection?'Collection':'PublishedFile'}Details/v0001/`, {
			form: {
				[`${isCollection?'collection':'item'}count`]: ids.length,
				publishedfileids: ids,
				format: 'json'
			}
		},  function (e, r, b) {
			if (e) return reject(e);

			try {
				b = JSON.parse(b).response;

				return resolve(isCollection 
					? b.response.publishedfiledetails 
					: b.response.collectiondetails.map(c => c.children).reduceRight((a, b) => a.concat(b)).map(a => a.publishedfileid)
					, isCollection);
			} catch (e) {
				return reject(e);
			}
		});
	});
};

GmodWorkshop.prototype.downloadFile = function (file, folder, cb) {
	let dapath = path.join(folder, file.publishedfileid + ".gma")
	let decompressor = lzma.createDecompressor();

	let f = fs.createWriteStream(dapath)
		.on('error', function(err) {
			return cb(e);
		})
		.on('finish', function() {
			if (cb) cb();
		})

	request(file.file_url)
		.on('error', function(e) {
			return cb(e);
		})
		.on('finish', function() {
			console.log(file.title);
		})
	.pipe(decompressor)
		.on('error', function(e) {
			return cb(e);
		})
	.pipe(f).on('error', function(e) {
			return cb(e);
		});
}


GmodWorkshop.prototype.downloadFiles = function (files, cb) {
	let outputPath = this.parseOutput(this.outputPath);

	if (files.length > 1) {
		cb("Found " + files.length + " addons, downloading now.", true);
	} else {
		cb("Found addon, downloading now.", true);
	}
	

	let s = 0;
	let d;

	for (d = 0; d < files.length; d++) {
		let file = files[d]

		if (file && file.file_url && file.filename && (file.filename.match(/(\.gma|\.gm)$/i))) {
			s++;

			if (d + 1 == files.length) {
				self.downloadFile(files[d], outputPath, cb);
			} else {
				self.downloadFile(files[d], outputPath);
			}
		}

		if (d + 1 == files.length && s < 1)
			cb("Couldn't find any gma files, perhaps you tried a collection?");
	}
};

GmodWorkshop.prototype.parseOutput = function(outputPath = 'addons') {
	let dir = path.resolve(process.cwd(), outputPath) + '/';

	if (!fs.existsSync(dir))
		fs.mkdir(dir, { recursive: true }, (e) => console.error(e));

	return dir;
}

GmodWorkshop.prototype.extractAddons = function (ids) {
	var fileids = [].concat(ids);
	
	return new Promise(function(resolve, reject) {
		GmodWorkshop.getDetails(fileids)
	});
};

GmodWorkshop.prototype.extractCollections = function(ids) {
	var fileids = [].concat(ids);

	return new Promise(function(resolve, reject) {
		GmodWorkshop.getDetails(fileids, true)
	});
};

module.exports = GmodWorkshop;
*/
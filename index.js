'use strict';

var es    = require('event-stream');
var aws   = require('aws-sdk');
var gutil = require('gulp-util');

var PLUGIN_NAME = 'gulp-elasticbeanstalk';


module.exports = function (awsCreds, params) {
  var params = params || {};

  // Configure the SDK
  if(awsCreds) {
    aws.config.credentials = awsCreds;
    aws.config.update({region: awsCreds.region});  
  } else {
    aws.config.update({region: params.Region});
  }

  return es.mapSync(function (file) {

    // Verify this is a file
    if (!file.isBuffer()) {
      return file;
    }

    // Verify required params are set.
    if (!params.ApplicationName) {
      gutil.log(gutil.colors.red('[ERROR] ApplicationName must be specified'));
      return file;
    }

    if (!params.VersionLabel) {
      gutil.log(gutil.colors.red('[ERROR] VersionLabel must be specified'));
      return file;
    }

    if (!params.Bucket) {
      gutil.log(gutil.colors.red('[ERROR] Bucket must be specified'));
      return file;
    }

    if (!params.Description) params.Description = null;

    if (!params.Key) params.Key = file.base;

    var s3params = {
      Bucket: params.Bucket,
      Key: params.Key,
      ACL: 'private',
      Body: file.contents,
    };

    var ebParams = {
      ApplicationName       : params.ApplicationName,
      VersionLabel          : params.VersionLabel,
      AutoCreateApplication : false,
      Description           : params.Description,
      SourceBundle: {
        S3Bucket : params.Bucket,
        S3Key    : params.Key
      }
    };

    var s3 = new aws.S3();

    s3.putObject(s3params, function (err, data) {
      if (err) {
        gutil.log(gutil.colors.red('[FAILED]', err.stack));
      } else {
        gutil.log(gutil.colors.green('[SUCCESS] Archive uploaded to S3', file.path + " -> " + params.Key));

        var eb = new aws.ElasticBeanstalk();

        eb.createApplicationVersion(ebParams, function (err, data) {
          if (err) {
            gutil.log(gutil.colors.red('[FAILED] Could not create EB Version: ' + err.message));
          } else {
            gutil.log(gutil.colors.green('[SUCCESS] Application version has been created successfully'));
          }

        });
      }
    });

  });

};

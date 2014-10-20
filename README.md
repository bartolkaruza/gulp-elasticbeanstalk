# gulp-elasticbeanstalk

## Usage

Add to your package.json file
"gulp-elasticbeanstalk": "^0.1"

Use in gulpfile.js

var eb = require("gulp-elasticbeanstalk");

var awsCreds = JSON.parse(fs.readFileSync('./aws.json'));

var params;

params = {
  ApplicationName: 'your-app-name',
  VersionLabel: 'your-app-version',
  Description: 'your-app-description',
  Bucket: 'a-valid-s3-bucket',
  Key: 'the-s3-key',
  Region: 'the-eb-region'
};

gulp.src('./bla.zip')
    .pipe(awseb(awsCreds, params));

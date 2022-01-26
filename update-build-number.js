const fs = require('fs');
const PATH = 'src/data/metadata.json';
console.log('Incrementing build number...');
fs.readFile(PATH, function(err, content) {
    if (err) throw err;
    var metadata = JSON.parse(content);
    metadata.buildRevision = metadata.buildRevision + 1;
    fs.writeFile(PATH, JSON.stringify(metadata), function(err){
        if (err) throw err;
        console.log(`Current build number: ${metadata.buildMajor}.${metadata.buildMinor}.${metadata.buildRevision}`);
    });
});
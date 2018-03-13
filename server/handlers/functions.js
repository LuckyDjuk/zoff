
function remove_unique_id(short_id) {
    db.collection("unique_ids").update({"_id": "unique_ids"}, {$pull: {unique_ids: short_id}}, function(err, docs) {});
}

function remove_name_from_db(guid, name) {
    db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: name}}, function(err, updated) {
        db.collection("user_names").remove({"guid": guid}, function(err, removed) {	});
    });
}

function remove_from_array(array, element){
    if(Functions.contains(array, element)){
        var index = array.indexOf(element);
        if(index != -1)
        array.splice(index, 1);
    }
}

function generate_channel_name(res) {
    var trying_id = uniqid.time().toLowerCase();
    db.collection("frontpage_lists").find({frontpage: {$exists: true }, "_id": trying_id }, {"_id": 1}, function(err, docs){
        if(docs.length == 0) {
            res.send(trying_id);
            return;
        }
        generate_channel_name(res);
    });
}

function get_short_id(socket) {
    var new_short_id = uniqid.time().toLowerCase();

    socket.join(new_short_id);
    socket.emit("id", new_short_id);
}

function check_inlist(coll, guid, socket, offline)
{
    if(!offline && coll != undefined){
        db.collection("connected_users").update({"_id": coll}, {$addToSet:{users: guid}}, {upsert: true}, function(err, updated) {
            if(updated.nModified > 0 || updated.upserted != undefined) {
                db.collection("connected_users").find({"_id": coll}, function(err, new_doc) {
                    db.collection("frontpage_lists").update({"_id": coll}, {$set: {"viewers": new_doc[0].users.length}}, function(){
                        if(new_doc[0].users == undefined || new_doc[0].users.length == undefined) {
                            io.to(coll).emit("viewers", 1);
                        } else {
                            io.to(coll).emit("viewers", new_doc[0].users.length);
                        }
                        db.collection("user_names").find({"guid": guid}, function(err, docs) {
                            if(docs.length == 1) {
                                socket.broadcast.to(coll).emit('chat', {from: docs[0].name, msg: " joined"});
                            }
                        });
                        db.collection("connected_users").update({"_id": "total_users"}, {$addToSet: {total_users: guid + coll}}, function(err, docs){});
                    });
                });
            }
        });

    } else {
        if(offline) {
            db.collection("connected_users").update({"_id": "offline_users"}, {$addToSet: {users: guid}}, function(err, docs){});
        } else {
            db.collection("connected_users").update({"_id": coll}, {$addToSet: {users: guid}}, function(err, docs){});
        }
        //
        if(coll != undefined && coll != "") {
            db.collection("connected_users").update({"_id": "total_users"}, {$addToSet: {total_users: guid + coll}}, function(err, docs) {});
        }
    }
}

function rndName(seed, len) {
    var vowels = ['a', 'e', 'i', 'o', 'u'];
    consts =  ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y'];
    len = Math.floor(len);
    word = '';
    is_vowel = false;
    var arr;
    for (var i = 0; i < len; i++) {
        if (is_vowel) arr = vowels;
        else arr = consts;
        is_vowel = !is_vowel;
        word += arr[(seed[i%seed.length].charCodeAt()+i) % (arr.length-1)];
    }
    return word;
}

function decrypt_string(socket_id, pw){
    try {
        /*var input = pw.split("$");
        pw = input[0];
        var testKey = ((new Buffer(socket_id).toString('base64')) + (new Buffer(socket_id).toString('base64'))).substring(0,32);
        var keyNew = (new Buffer(testKey)).toString('base64');
        var encrypted = CryptoJS.enc.Base64.parse(pw);
        var key = CryptoJS.enc.Base64.parse(keyNew);
        var iv = CryptoJS.enc.Base64.parse(input[1]);
        var decrypted = CryptoJS.enc.Utf8.stringify(
            CryptoJS.AES.decrypt({
                ciphertext: encrypted
            }, key, {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
                iv: iv,
            })
        );*/
        //return atob(pw);
        return Buffer.from(pw, 'base64').toString('ascii')
        //return decrypted;
    } catch(e) {
        return "";
    }
}

function get_time()
{
    var d = new Date();
    var time = Math.floor(d.getTime() / 1000);
    return time;
}

function contains(a, obj) {
    try{
        var i = a.length;
        while (i--) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }catch(e){
        return false;
    }
}

function hash_pass(adminpass, hex) {
    if(hex) return crypto.createHash('sha256').update(adminpass).digest('hex');
    return crypto.createHash('sha256').update(adminpass).digest('base64');
}

module.exports.generate_channel_name = generate_channel_name;
module.exports.remove_unique_id = remove_unique_id;
module.exports.remove_name_from_db = remove_name_from_db;
module.exports.remove_from_array = remove_from_array;
module.exports.get_short_id = get_short_id;
module.exports.check_inlist = check_inlist;
module.exports.rndName = rndName;
module.exports.decrypt_string = decrypt_string;
module.exports.get_time = get_time;
module.exports.contains = contains;
module.exports.hash_pass = hash_pass;
